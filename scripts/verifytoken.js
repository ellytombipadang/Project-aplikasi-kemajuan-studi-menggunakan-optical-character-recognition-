const jose = require("jose");
// https://github.com/panva/jose/blob/HEAD/docs/functions/jwt_verify.jwtVerify.md#readme
const verifytoken = async (jwtToken, next) => {
    const alg = 'RS256'
    const spki = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwhYOFK2Ocbbpb/zVypi9
    SeKiNUqKQH0zTKN1+6fpCTu6ZalGI82s7XK3tan4dJt90ptUPKD2zvxqTzFNfx4H
    HHsrYCf2+FMLn1VTJfQazA2BvJqAwcpW1bqRUEty8tS/Yv4hRvWfQPcc2Gc3+/fQ
    OOW57zVy+rNoJc744kb30NjQxdGp03J2S3GLQu7oKtSDDPooQHD38PEMNnITf0pj
    +KgDPjymkMGoJlO3aKppsjfbt/AH6GGdRghYRLOUwQU+h+ofWHR3lbYiKtXPn5dN
    24kiHy61e3VAQ9/YAZlwXC/99GGtw/NpghFAuM4P1JDn0DppJldy3PGFC0GfBCZA
    SwIDAQAB
    -----END PUBLIC KEY-----`
    const publicKey = await jose.importSPKI(spki, alg)
    const jwt = jwtToken;
    try {
        const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey)
        return {
            payload, protectedHeader
        }
    } catch (err) {
        return err
    }

    // next();
}

module.exports = verifytoken;
