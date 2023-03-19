import { join } from 'path';
import { BadRequestException, Header, Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';

@Injectable()
export class FilesService {

  findOneById(imageName: string){
    
    const path = join( __dirname, '../../static/products', imageName)
    if ( !existsSync(path) )
    throw new NotFoundException(`No product found with name ${imageName}`)
    
    const file = createReadStream(join(process.cwd(), `./static/products/${imageName}`));
    
    return file;

    
    // return path
  }

}
