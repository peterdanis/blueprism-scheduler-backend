import React, { forwardRef, useEffect, useState } from "react";
import CustomModal from "../CustomModal";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
} from "antd";
import fetchApi from "../../services/fetchApi";
import notification from "../../utils/notification";
import { RuntimeResource, Schedule, Task } from "../../utils/types";
import { filterInSelect, formSettings } from "../../utils/commonSettings";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useForm } from "antd/lib/form/Form";

type Props = {
  loadData: () => void;
  task: Task | undefined;
};

const AddOrEditTaskModal = forwardRef(({ loadData, task }: Props, ref) => {
  const [form] = useForm();
  const [hasError, setHasError] = useState(false);

  const onOkHandler = async () => {
    let result;
    const getInputs = () => {
      const inputsList = form.getFieldValue("inputs");
      if (inputsList) {
        return inputsList.map((input: Input) => ({
          ...input,
          "@type": "text",
        }));
      }
    };
    const data: Task = {
      name: form.getFieldValue("name"),
      process: form.getFieldValue("process"),
      inputs: getInputs(),
      softTimeout: form.getFieldValue("softTimeout"),
      hardTimeout: form.getFieldValue("hardTimeout"),
    };
    if (task) {
      result = await fetchApi(`/api/tasks/${task.id}`, "PATCH", data);
    } else {
      result = await fetchApi("/api/tasks/", "POST", data);
    }
    if (result) {
      notification(
        `Task ${task ? "updated" : "created"}`,
        undefined,
        "success",
        6
      );
      loadData();
    }
  };

  useEffect(() => {
    form.resetFields();
    let initialValues: Task;
    if (task) {
      initialValues = task;
    } else {
      initialValues = {
        name: "",
        process: "",
        softTimeout: 86400000,
        hardTimeout: 86400000,
      };
    }
    form.setFieldsValue(initialValues);
    setHasError(true);
  }, [task, form]);

  return (
    <CustomModal
      okFn={onOkHandler}
      okButtonName={task ? "Save" : "Create"}
      cancelButtonName="Cancel"
      ref={ref}
      okButtonDisabled={hasError}
      key="AddOrEditTaskModal"
      width={800}
    >
      <h3>Edit task</h3>
      <br />
      <Form
        form={form}
        onFieldsChange={(_, fields) => {
          setHasError(
            form.getFieldsError().filter((field) => field.errors.length > 0)
              .length > 0
          );
        }}
        {...formSettings}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter schedule name" }]}
        >
          <Input placeholder="Task name" />
        </Form.Item>
        <Tooltip title="Process name, exactly as it appears in BP.">
          <Form.Item
            label="Process name"
            name="process"
            rules={[
              {
                required: true,
                message: "Please enter process name",
              },
            ]}
          >
            <Input placeholder="Process name, exactly as it appears in BP." />
          </Form.Item>
        </Tooltip>
        <Tooltip title="Soft timeout means that a 'stop request' will be sent. Timeout is in milliseconds.">
          <Form.Item label="Soft timeout" name="softTimeout">
            <Input />
          </Form.Item>
        </Tooltip>
        <Tooltip title="Hard timeout means that task will be killed. Timeout is in milliseconds.">
          <Form.Item label="Hard timeout" name="hardTimeout">
            <Input />
          </Form.Item>
        </Tooltip>
        <Form.Item label="Inputs">
          <Form.List name="inputs">
            {(fields, { add, remove }) => {
              return (
                <div key="inputs-div">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <Form.Item
                        key={`${field.key}-name`}
                        name={[field.name, "@name"]}
                        style={{
                          display: "inline-block",
                          width: "calc(40%)",
                        }}
                        rules={[
                          {
                            required: true,
                            message: "Provide parameter name",
                          },
                        ]}
                      >
                        <Input placeholder="Parameter name" />
                      </Form.Item>
                      <div
                        style={{
                          paddingLeft: "10px",
                          display: "inline-block",
                          // width: "calc(1%)",
                        }}
                      />
                      <Form.Item
                        key={`${field.key}-value`}
                        name={[field.name, "@value"]}
                        style={{
                          display: "inline-block",
                          width: "calc(40%)",
                        }}
                        rules={[
                          {
                            required: true,
                            message: "Provide parameter value",
                          },
                        ]}
                      >
                        <Input placeholder="Value" />
                      </Form.Item>
                      <div
                        style={{
                          paddingLeft: "10px",
                          display: "inline-block",
                          width: "calc(10%)",
                        }}
                      >
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      </div>
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add task
                    </Button>
                  </Form.Item>
                </div>
              );
            }}
          </Form.List>
        </Form.Item>
      </Form>
    </CustomModal>
  );
});

export default AddOrEditTaskModal;
