export default {
  required(message = '', trigger = 'blur') {
    return {
      required: true,
      message,
      trigger,
    }
  },
  pattern(pattern, message = '', trigger = 'blur') {
    return {
      pattern,
      message,
      trigger,
    }
  },
  validator(validator, trigger = 'blur') {
    return {
      validator,
      trigger,
    }
  },
}
