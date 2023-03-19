import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger/dist/decorators';

import { AuthService } from './auth.service';
import { getUser, RawHeaders, Auth, RoleProtected } from './decorators';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRolesInterface } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto){
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @getUser() user: User
  ){
    return this.authService.checkAuthStatus(user)
  }

  @Get('secure')
  @UseGuards( AuthGuard() )
  newEndPointWithJwt(
    // @Req() tomate: Express.Request
    @getUser() user: User, // Lo que regrese el customDeco va en lo naranja como param
    @getUser('email') email: string,
    @RawHeaders() rawHeaders: string[]
    ){
    // console.log({ user: tomate.user});
    return {
      ok: true,
      msg: 'New route accessed',
      user,
      email,
      rawHeaders
    }
  }
  // // el array es atrapado por el handler en el guard
  // // roles es muy volatil, si lo escribes mal, es posible que igual pase la validacion
  // @SetMetadata('roles', ['admin','super-user']) 

  @Get('privad2')
  @RoleProtected( ValidRolesInterface.regular )
  @UseGuards( AuthGuard(), UserRoleGuard )
  private2Rout3(
    @getUser() user: User,
  ){

    return {
      ok: true,
      user
    }
  }
  
  // Sera lo mismo que el privad2 pero con decorator composition
  @Get('privad3')
  @Auth( ValidRolesInterface.admin, ValidRolesInterface.superUser )
  private3Rout4(
    @getUser() user: User,
  ){

    return {
      ok: true,
      user
    }
  }
}
