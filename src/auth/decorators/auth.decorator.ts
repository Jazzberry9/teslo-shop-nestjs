import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';
import { ValidRolesInterface } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';

export function Auth(...roles: ValidRolesInterface[]) {
  return applyDecorators(
    RoleProtected( ...roles ),
    UseGuards( AuthGuard(), UserRoleGuard )
  );
}