const AWS = require('aws-sdk');

const S3 = new AWS.S3({
    accessKeyId: 'AKIA2N2XQT2B4YCL2PLO',
    secretAccessKey: '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'
})

function uploadFiles(files, uuid) {
    if (files.length > 1) {
        upload(files, uuid);
        return files;
    } else {
        let myFiles = [files];
        upload(myFiles, uuid);
        return myFiles;
    }
}

function upload(files, uuid) {
    files.forEach((file) => {
        const params = {
            Bucket: process.env.AWSBUCKETNAME,
            Key: `public/${uuid}.${file.name}`,
            Body: file.data, //(buffer file)
            ACL: 'public-read',
            ContentType: file.mimetype
        }
        S3.upload(params, (error, data) => {
            if (error) {
                return error;
            }
            return data;
            
        });
    });
}

function deleteFile(fileName) {
    const params = {
        Bucket: process.env.AWSBUCKETNAME,
        Key: fileName
    }
    S3.deleteObject(params, function (err, data) {
        if (err) console.log(err);
        else data; 
    });
}

module.exports = {
    uploadFiles: uploadFiles,
    deleteFile: deleteFile
};