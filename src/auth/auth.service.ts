import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from 'src/employee/schemas/employee.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const employee = await this.employeeService.findByUsername(
      loginDto.username,
    );
    const payload = {
      username: employee.username,
      sub: employee.id,
      code: employee.code,
    }; // dados que desejo incluir no token
    return {
      access_token: this.jwtService.sign(payload), // retorna o token JWT como uma string
    };
  }

  async validateEmployeeByUsername(
    username: string,
    pass?: string,
  ): Promise<any> {
    const employee = await this.employeeService.findByUsername(username);
    const isPasswordValid = await bcrypt.compare(pass, employee.password);

    if (employee && isPasswordValid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = employee; // desestruturação de user sem o password, separo as infos do usuario
      return result;
    }
    return null;
  }

  async validateEmployeeById(id: string): Promise<any> {
    return await this.employeeService.findById(id);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
