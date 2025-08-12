import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entity/company.entity';
import { User } from 'src/user/entity/user.entity';
import { UserType } from 'src/common/enums/user-type.enum';
import { UserStatus } from 'src/common/enums/user-status';
import { CreateCompanyDto } from './dto/create-company';
import { HashUtil } from 'src/common/utils/hash.util';
import { EmailService } from 'src/common/services/email.service';
import { SmsService } from 'src/common/services/sms.service';
import { SendMailDto } from 'src/common/dtos/send-mail.dto';
import { Otp } from 'src/otp/entity/otp.entity';
import { OtpUtil } from 'src/common/utils/otp.util';
import { SendOtpType } from 'src/common/enums/send-otp-type.enum';
import { GenericQueryService } from 'src/common/services/generic-query.service';
import { GenericQueryDto } from 'src/common/dtos/GenericQueryDto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyStatus } from 'src/common/enums/company-status';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly genericQuery: GenericQueryService,
  ) {}
  async create(
    createCompanyDto: Omit<CreateCompanyDto, 'sendOtpType'>,
    adminInfo: any,
    sendOtpType: SendOtpType,
  ){
    try {
      const { name, email, phone, password, ...rest } = createCompanyDto;
      const isSuperAdmin = !!adminInfo?.isSuperAdmin;
      const actorUserId = adminInfo?.userId ?? null;
      const existingCompany = await this.companyRepo.findOne({
        where: [{ name }, { email }],
      });

      const userWhere: any[] = [{ email }];
      if (phone) userWhere.push({ phone });
      const existingUser = await this.userRepo.findOne({ where: userWhere });

      // const [existingCompany, existingUser] = await Promise.all([
      //   this.companyRepo.findOne({ where: [{ name }, { email }] }),
      //   this.userRepo.findOne({ where: [{ email }, { phone }] }),
      // ]);
      if (existingCompany)
        throw new BadRequestException('Company name or email already exists');
      if (existingUser)
        throw new BadRequestException(
          'User with this email or phone already exists',
        );

      // Generate Hash password
      const hashedPassword = await HashUtil.hashPassword(password);
      //  Create new user
      const user = this.userRepo.create({
        email,
        ...(phone ? { phone } : {}),
        password: hashedPassword,
        userType: UserType.MERCHANT,
        userStatus: isSuperAdmin ? UserStatus.ACTIVE : UserStatus.PENDING,
        isActive: isSuperAdmin,
      });
      const savedUser = await this.userRepo.save(user);
      //  Create new company
      const company = this.companyRepo.create({
        name,
        email,
        phone,
        ...rest,
        isAdminCreated: isSuperAdmin,
        isOtpVerified: isSuperAdmin,
        status: isSuperAdmin ? CompanyStatus.APPROVED : CompanyStatus.PENDING,
        approvedBy: isSuperAdmin ? actorUserId : null, // ✅
        user: savedUser,
      });

      await this.companyRepo.save(company);
      user.companyId = company.companyId;
      await this.userRepo.save(user);
      delete user.password; 

      let message = 'Company created successfully';
      //  Generate + Send OTP if not SUPER_ADMIN
      if (!isSuperAdmin) {
        if (!sendOtpType)
          throw new BadRequestException('sendOtpType is required');
        const otpCode = OtpUtil.generateOtp();
        const otpExpiry = OtpUtil.getExpiry();

        // Save OTP (overwrite if already exists for user)
        await this.otpRepo.save({
          code: otpCode,
          expireAt: otpExpiry.toISOString(),
          used: false,
          user: savedUser,
          userId: savedUser.userId,
        });

        //  Send OTP
        if (sendOtpType === SendOtpType.EMAIL) {
          const payload: SendMailDto = {
            to: email,
            subject: 'Your OTP for AlphaPo Registration',
            html: `
              <p>Hi ${name},</p>
              <p>Your OTP is: <strong>${otpCode}</strong></p>
              <p>This code will expire in 10 minutes.</p>
            `,
          };

          await this.emailService.sendMail(
            payload.to,
            payload.subject,
            payload.html,
          );
          message += '. Verification OTP sent via email.';
        } else if (sendOtpType === SendOtpType.PHONE) {
          if (!phone)
            throw new BadRequestException('Phone is required for SMS OTP');
          await this.smsService.sendSms(
            phone,
            `Welcome to AlphaPo. Your OTP is: ${otpCode}. It will expire in 10 minutes.`,
          );
          message += '. Verification OTP sent via SMS.';
        } else {
          throw new BadRequestException('Invalid OTP send type');
        }
      }

      return { message,  user  };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      console.error('Company creation failed:', error);
      throw new InternalServerErrorException('Failed to create company');
    }
  }

  async findAll(options: GenericQueryDto, user?: any) {
    if (user && user.userType === UserType.MERCHANT) {
      options.filters = options.filters || {};
      options.filters.companyId= user.companyId.toString();
    }
    return await this.genericQuery.query(this.companyRepo, 'company', options, {
      searchableColumns: ['name', 'email', 'phone' ],
      enforcedFilters: { softDelete: false },
      relations: ['user', 'balances'],
      excludedFields: ['user.password', 'user.refreshTokens', 'user.otp'],
    });
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { companyId: id },
      relations: ['user', 'balances'],
    });
    if (!company) throw new NotFoundException('Company not found');
    if (company.user) {
      delete company.user.password;
    }
    return company;
  }

  async approveCompany(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const company = await this.companyRepo.findOne({
      where: { companyId: id, isOtpVerified: true },
      relations: ['user', 'user.role'],
    });
    if (!company) throw new NotFoundException('Company not found');
    company.status = CompanyStatus.APPROVED;
    if (company.user) {
      company.user.isActive = true;
      company.approvedBy = userId;
      company.user.userStatus = UserStatus.ACTIVE;
      console.log('Updating user status to ACTIVE', company, userId);
      await this.companyRepo.save(company);
      await this.userRepo.save(company.user);
    }
    return {
      message: `Company ${company.name} updated successfully`,
    };
  }

  async update(id: number, dto: UpdateCompanyDto) {
    const company = await this.findOne(id);
    if (!company) throw new NotFoundException('Company not found');
    const updatedCompany = await this.companyRepo.update(id, dto);
    if (!updatedCompany.affected) {
      throw new BadRequestException('Failed to update company');
    }
    return {
      message: `Company with ${company.companyId} updated successfully`,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const company = await this.findOne(id);
    if (!company) throw new NotFoundException('Company not found');
    await this.companyRepo.update(+id, { softDelete: true });
    return {
      message: `Company with ${company.companyId} deleted successfully`,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    const { userId, code } = dto;

    const user = await this.userRepo.findOne({
      where: { userId },
      relations: ['otp'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.otpRepo.findOne({
      where: { code },
    });

    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otp.isUsed) {
      throw new BadRequestException('OTP already used');
    }

    if (new Date(otp.expireAt) < new Date()) {
      throw new BadRequestException(
        'OTP has expired. PLease request a new one',
      );
    }

    const company = await this.companyRepo.findOne({
      where: { user: { userId } },
      relations: ['user'],
    });

    if (!company) {
      throw new NotFoundException('Company not found for this user');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);
    company.isOtpVerified = true;
    await this.companyRepo.save(company);

    return { message: 'OTP verified successfully. Account activated.' };
  }
}
