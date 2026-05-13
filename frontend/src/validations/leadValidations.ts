import * as Yup from 'yup';

export const leadValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required'),

  company: Yup.string()
    .required('Company is required'),

  industry: Yup.string()
    .required('Industry is required'),

  deal_size: Yup.number()
    .required('Deal size is required')
    .positive('Deal size must be positive'),

  stage: Yup.string()
    .required('Stage is required')
});