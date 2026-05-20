export const createUserValidationSchema = {
  name: {
    isLength: {
      options: {
        min: 3,
        max: 32,
      },
      errorMessage:
                'Username must be at least 5 characters with a max of 32 characters',
    },
    notEmpty: {
      errorMessage: 'Username cannot be empty',
    },
    isString: {
      errorMessage: 'Username must be a string!',
    },
  },
  email: {
    notEmpty: true,
  },
  password: {
    notEmpty: true,
  },
  role: {
    notEmpty: true,
    isString: true,
    isIn: {
      options: [['admin', 'moderator', 'user']],
      errorMessage: 'Role must be either admin, moderator, or user',
    },
  }
};