import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'
import { JwtPayload } from './interfaces/jwt.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  private readonly logger = new Logger()

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // proviene de jwt module en el authModule
    // Aqui viene toda la config, el expire y la jwtkey porejem
    private readonly jwtService: JwtService,
  ){}
  
  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;
      
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      await this.userRepository.save( user )
      delete user.password

      return { 
        ...user,
        token: this.getJwtToken({ id: user.id })
      }

    } catch (error) {
      this.handleBDError(error)
    }
  }

  async login( loginUserDto: LoginUserDto) {
    
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { password: true, email: true, id: true}
    });

    if (!user)
      throw new UnauthorizedException('Credentials are incorrect (email)')
    
    if ( !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are incorrect (password)')

    // const { product, ...datosUsuario } = user;

    return { 
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
    
    // retornar JWT


  }

  async checkAuthStatus( user: User){

    return {
      ...user,
      token: this.getJwtToken({ id: user.id})
    }
  }

  private handleBDError( error: any ) {
    if( error.code === '23505')
        throw new BadRequestException(error.detail)
      
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }

  private getJwtToken( payload: JwtPayload ){

    const token = this.jwtService.sign(payload);

    return token;

  }
}
