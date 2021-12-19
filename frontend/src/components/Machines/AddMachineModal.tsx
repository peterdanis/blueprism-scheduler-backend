import React, { forwardRef, useState } from "react";
import CustomModal from "../CustomModal";
import { Form, Input, Select } from "antd";
import fetchApi from "../../services/fetchApi";
import { FieldData } from "rc-field-form/lib/interface";
import notification from "../../utils/notification";
import { RuntimeResource } from "../../utils/types";
import { formSettings } from "../../utils/commonSettings";

type Props = {
  loadData: () => void;
};

const AddMachineModal = forwardRef((props: Props, ref) => {
  const [formData, setFormData] = useState([] as FieldData[]);

  const getFormValue = (fieldName: string) =>
    formData.filter((item) => {
      const a = item.name as string[];
      return a[0] === fieldName;
    })[0]?.value;

  const onOkHandler = async () => {
    const data: RuntimeResource = {
      auth: getFormValue("auth"),
      apiKey: getFormValue("apiKey"),
      hostname: getFormValue("hostname"),
      https: getFormValue("https"),
      port: getFormValue("port"),
      password: getFormValue("password"),
      friendlyName: getFormValue("friendlyName"),
      username: getFormValue("username"),
    };
    const result = await fetchApi("/api/runtimeResources", "POST", data);
    setFormData([]);
    if (result) {
      notification("Machine created", undefined, "success", 6);
      props.loadData();
    }
  };

  const onCancelHandler = () => {
    setFormData([]);
  };

  return (
    <CustomModal
      key="AddOrEditMachineModal"
      okFn={onOkHandler}
      cancelFn={onCancelHandler}
      okButtonName="Add"
      cancelButtonName="Cancel"
      ref={ref}
      okButtonDisabled={
        formData.filter((item) => item.errors?.length).length > 0
      }
    >
      <h3>Add new user</h3>
      <br />
      <Form
        fields={formData}
        onFieldsChange={(_, fields) => {
          setFormData(fields);
        }}
        {...formSettings}
      >
        <Form.Item
          label="Friendly name"
          name="friendlyName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Hostname"
          name="hostname"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Port" name="port" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Authentication"
          name="auth"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="basic">Basic</Select.Option>
            <Select.Option value="apikey">API key</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Username" name="username">
          <Input />
        </Form.Item>
        <Form.Item label="Password" name="password">
          <Input.Password />
        </Form.Item>
      </Form>
    </CustomModal>
  );
});

export default AddMachineModal;
