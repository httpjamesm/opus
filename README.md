# Opus - Get stuff done securely.

Opus is a functional, minimal and secure end-to-end encrypted task manager. Store grocery lists, to-do lists, shopping wishlists and more with the peace of mind that your data is truly yours.

## Security Architecture

### Key Encryption

#### Fundamentals

**Master Key**
Upon registration, Opus creates a random AES-256-GCM keypair, called your "master key". This master key is used to directly encrypt tag names and item keys for tasks. This key never leaves your device unencrypted.

**Master Key Encryption Key**
Before sending off your master key to Opus' server, it is client-side encrypted with an AES-256-GCM keypair derived from your password.

### Authentication

Opus uses a username and password to authenticate you.

#### Password
Since Opus uses end-to-end encryption, the user's password cannot leave their device without being hashed. Salted PBKDF2 is used to hash the password on the client before being shipped off to Opus. On subsequent logins, the server provides the password salt and the client uses the salt to hash the password. This hashed password is then sent to the server for authentication.

#### Sessions
Opus uses JWT to wrap a unique session identifier. This identifier doesn't contain any personal information, but it is attached to your account on the server.

### AES Encryption

All AES encryption is performed in GCM mode to provide authentication in parallel with encryption. Since GCM is very sensitive to initialization vector (IV) reuse, Opus generates a cryptographic random IV for each encryption and re-encryption operation.

### Tag Encryption

Tags are encrypted with the master key directly for performance reasons.

### Task Encryption

#### Task Encryption Key

Tasks are encrypted with a unique randomly generated AES-256-GCM keypair. Every task is encrypted using their own keypair. This key is encrypted with the master key and shipped off to the server along with the encrypted name, description and due date.