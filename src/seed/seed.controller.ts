import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';

import { ValidRolesInterface } from '../auth/interfaces';
import { Auth } from '../auth/decorators/auth.decorator';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(
    private readonly seedService: SeedService    
    ) {}

  @Get('')
  @Auth( ValidRolesInterface.admin, ValidRolesInterface.superUser )
  execute(){
    return this.seedService.generateSeed()
  }
}
