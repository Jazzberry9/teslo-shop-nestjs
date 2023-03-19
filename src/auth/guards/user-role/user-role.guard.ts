import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ){}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler())

    if( !validRoles) return true; // si no existen los roles, cualquier puede entrar
    if( validRoles.length === 0 ) return true; // sino se ha configurado ningun rol, dejalo pasar

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    
    if(!user)
      throw new NotFoundException(`User not foundx1`)

    for (const roles of user.roles) {
      if( validRoles.includes(roles)){
        return true
      }
    }
    throw new UnauthorizedException(`El usuario ${user.fullName} necesita un rol de: ${validRoles}`)
  }
}
