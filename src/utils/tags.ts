import { Tag } from "src/interfaces/tag";
import { decrypt } from "./aes";

export const decryptName = async (tag: Tag, cryptoKey: CryptoKey) => {
    const decryptedName = await decrypt(
        { data: tag.nameCiphertext, iv: tag.nameIV },
        cryptoKey
    );

    const dec = new TextDecoder();

    return dec.decode(decryptedName);
};
