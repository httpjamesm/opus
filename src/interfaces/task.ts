export interface Task {
    id: number;
    nameCiphertext: string;
    descriptionCiphertext: string;
    nameIV: string;
    descriptionIV: string;
    keyCiphertext: string;
    keyIV: string;
    completed: boolean;
}