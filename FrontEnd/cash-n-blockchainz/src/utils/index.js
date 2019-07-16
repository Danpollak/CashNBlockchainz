import RandomString from 'randomstring'
const crypto = require('crypto');

const generatePassword = () => {
    return RandomString.generate({length: 12 }).toLowerCase()
}

const encryptMessage = ({sender, content}) => {
    const password = generatePassword();
    const message = `${sender}-${content}-${password}`
    const encryptedMessage = crypto.createHash('sha256').update(message).digest('base64');
    return {
        encryptedMessage, password
    }
}

export {encryptMessage}