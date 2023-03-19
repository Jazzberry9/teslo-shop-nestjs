
export const fileFilter = ( req: Express.Request, file: Express.Multer.File, cb: Function) => {
    
    if (!file) return cb( new Error('File doesnt exist'), false);

    const filesImages = file.mimetype.split('/')
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif']

    if ( validExtensions.includes( filesImages[filesImages.length - 1]) ) {
        return cb(null, true)
    }

    cb(null, false)
}

