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
  ) {}
   async create(
    createCompanyDto: Omit<CreateCompanyDto, 'sendOtpType'>,
    isSuperAdmin: boolean,
    sendOtpType: SendOtpType,
  ): Promise<{ message: string }> {
    const { name, email, phone, password, ...rest } = createCompanyDto;
    try {
      const [existingCompany, existingUser] = await Promise.all([
        this.companyRepo.findOne({ where: [{ name }, { email }] }),
        this.userRepo.findOne({ where: [{ email }, { phone }] }),
      ]);

      if (existingCompany) {
        throw new BadRequestException('Company name or email already exists');
      }

      if (existingUser) {
        throw new BadRequestException(
          'User with this email or phone already exists',
        );
      }
      // Generate Hash password
      const hashedPassword = await HashUtil.hashPassword(password);
      //  Create new user
      const user = this.userRepo.create({
        email,
        phone,
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
        isAdminCreated: isSuperAdmin? true : false,
        user: savedUser,
      });

      await this.companyRepo.save(company);

      let message = 'Company created successfully';
      //  Generate + Send OTP if not SUPER_ADMIN
      if (!isSuperAdmin) {
        const otpCode = OtpUtil.generateOtp();
        const otpExpiry = OtpUtil.getExpiry();

        // Save OTP (overwrite if already exists for user)
        await this.otpRepo.save({
          code: otpCode,
          expireAt: otpExpiry.toISOString(),
          used: false,
          user: savedUser,
          userId: savedUser.userId
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

          await this.emailService.sendMail(payload.to, payload.subject, payload.html);
          message += '. Verification OTP sent via email.';
        } else if (sendOtpType === SendOtpType.PHONE) {
          await this.smsService.sendSms(
            phone,
            `Welcome to AlphaPo. Your OTP is: ${otpCode}. It will expire in 10 minutes.`,
          );
          message += '. Verification OTP sent via SMS.';
        } else {
          throw new BadRequestException('Invalid OTP send type');
        }
      }

      return { message };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      console.error('Company creation failed:', error);
      throw new InternalServerErrorException('Failed to create company');
    }
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({ relations: ['user', 'balances'] });
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { companyId: id },
      relations: ['user', 'balances'],
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  //   async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
  //     const company = await this.findOne(id);
  //     await this.companyRepo.update(id, dto);
  //     return this.findOne(id);
  //   }

  async remove(id: number): Promise<{ success: true }> {
    const company = await this.findOne(id);
    await this.companyRepo.remove(company);
    return { success: true };
  }
}
