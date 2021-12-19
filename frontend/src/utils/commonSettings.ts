import { FormProps, SelectProps } from "antd";

export const idColumnWidth = "45px";
export const tableSettings = {
  sticky: true,
  bordered: true,
  size: "small" as "small" | "middle" | "large",
};
export const formSettings: Partial<FormProps> = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 },
  size: "small",
};
export const filterInSelect = {
  showSearch: true,
  filterOption: (input: string, option: { children?: string }) => {
    if (option && option.children) {
      return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    return false;
  },
} as SelectProps<string>;
