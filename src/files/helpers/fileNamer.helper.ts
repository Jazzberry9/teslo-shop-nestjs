import { v4 as uuid } from 'uuid'


export const fileNamer = ( req: Express.Request, file: Express.Multer.File, cb: Function) => {
    
    if (!file) return cb( new Error('File doesnt exist'), false);

    const filesImages = file.mimetype.split('/');
    const fileExtension = filesImages[filesImages.length - 1];
    const fileName = `${ uuid()}.${fileExtension}`

    cb(null, fileName)
}

