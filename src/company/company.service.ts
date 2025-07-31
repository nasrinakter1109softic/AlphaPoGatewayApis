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

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

//   async create(createCompanyDto: CreateCompanyDto){
//     const { name, email, phone, password } = createCompanyDto;

//     // Check if company already exists
//     const existingCompany = await this.companyRepo.findOne({
//       where: [{ name }, { email }],
//     });

//     if (existingCompany) {
//       throw new BadRequestException('Company name or email already exists');
//     }

//     // Check if user with the same email or phone already exists
//     const existingUser = await this.userRepo.findOne({
//       where: [{ email }, { phone }],
//     });
//     if (existingUser) {
//       throw new BadRequestException(
//         'User with this email or phone already exists',
//       );
//     }
//     // hash password
//     const hashedPassword = await HashUtil.hashPassword(password);
//     // Create linked user
//     const user = this.userRepo.create({
//       email,
//       phone,
//       password: hashedPassword,
//       userType: UserType.COMPANY,
//       userStatus: UserStatus.PENDING,
//       isActive: true,
//     });
//     const savedUser = await this.userRepo.save(user);

//     const company = this.companyRepo.create({
//       ...createCompanyDto,
//       user: savedUser,
//     });
//     this.companyRepo.save(company);
//     return { message: 'Company created successfully' };
//   }

 async create(createCompanyDto: CreateCompanyDto) {
  const { name, email, phone, password, ...rest } = createCompanyDto;

  try {
    //  Check for duplicate company
    const [existingCompany, existingUser] = await Promise.all([
      this.companyRepo.findOne({ where: [{ name }, { email }] }),
      this.userRepo.findOne({ where: [{ email }, { phone }] }),
    ]);

    if (existingCompany) {
      throw new BadRequestException('Company name or email already exists');
    }

    if (existingUser) {
      throw new BadRequestException('User with this email or phone already exists');
    }

    // 🔐 Hash password
    const hashedPassword = await HashUtil.hashPassword(password);

    // 👤 Create and persist user
    const user = this.userRepo.create({
      email,
      phone,
      password: hashedPassword,
      userType: UserType.COMPANY,
      userStatus: UserStatus.PENDING,
      isActive: true,
    });

    const savedUser = await this.userRepo.save(user);

    // 🏢 Create and persist company
    const company = this.companyRepo.create({
      name,
      email,
      phone,
      ...rest,
      user: savedUser,
    });

    await this.companyRepo.save(company);

    return { message: 'Company created successfully' };

  } catch (error) {
    if (error instanceof BadRequestException) throw error;

    console.error('❌ Company creation failed:', error);
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
