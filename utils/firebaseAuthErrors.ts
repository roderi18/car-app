export const getFirebaseAuthErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ese correo ya esta registrado. Intenta iniciar sesion.';
    case 'auth/invalid-email':
      return 'Escribe un correo valido.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Correo o contrasena incorrectos.';
    case 'auth/weak-password':
      return 'La contrasena debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar. Revisa tu conexion a internet.';
    case 'auth/operation-not-allowed':
      return 'El proveedor de email/contrasena no esta habilitado en Firebase Authentication.';
    default:
      return message || 'Ocurrio un error inesperado. Intenta de nuevo.';
  }
};
