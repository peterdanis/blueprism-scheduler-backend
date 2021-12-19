import { FieldData } from "rc-field-form/lib/interface";

const getFormValue = (formData: FieldData[]) => (fieldName: string): any =>
  formData.filter((item) => {
    const name = item.name as string[];
    return name[0] === fieldName;
  })[0]?.value;

export default getFormValue;
