import timezones from "./timezones.json";
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import CustomModal from "../CustomModal";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tooltip,
} from "antd";
import fetchApi from "../../services/fetchApi";
import notification from "../../utils/notification";
import {
  RuntimeResource,
  Schedule,
  ScheduleTask,
  Task,
} from "../../utils/types";
import { filterInSelect, formSettings } from "../../utils/commonSettings";
import cronstrue from "cronstrue";
import { parseExpression } from "cron-parser";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useForm } from "antd/lib/form/Form";
import moment from "moment";

type Props = {
  defaultPriority: number;
  defaultTimezone: string;
  loadData: () => void;
  machines: RuntimeResource[];
  schedule: Schedule | undefined;
  tasks: Task[];
};

const AddOrEditScheduleModal = forwardRef(
  (
    {
      defaultPriority,
      defaultTimezone,
      loadData,
      machines,
      schedule,
      tasks,
    }: Props,
    ref
  ) => {
    const [readableRule, setReadableRule] = useState("");
    const [nextIterations, setNextIterations] = useState([] as string[]);
    const [form] = useForm();
    const [hasError, setHasError] = useState(true);

    const onOkHandler = async () => {
      let result;
      const getScheduledTask = (): ScheduleTask[] | undefined => {
        const taskList = form.getFieldValue("tasks");
        if (taskList) {
          const result = taskList.map((el: any, index: number) => {
            let scheduleId: number | undefined;
            let scheduleTaskId: number | undefined;
            if (schedule) {
              scheduleId = schedule.id;
              if (schedule.scheduleTask && schedule.scheduleTask[index]) {
                scheduleTaskId = schedule.scheduleTask[index].id;
              }
            }
            return {
              id: scheduleTaskId,
              step: index + 1,
              schedule: { id: scheduleId },
              task: { id: el.task },
              delayAfter: el.delay,
            };
          });
          return result;
        }
      };
      const data: Schedule = {
        name: form.getFieldValue("name"),
        priority: form.getFieldValue("priority"),
        rule: form.getFieldValue("rule"),
        runtimeResource: {
          id: form.getFieldValue("runtimeResourceId"),
        } as RuntimeResource,
        scheduleTask: getScheduledTask(),
        softTimeout: form.getFieldValue("softTimeout"),
        hardTimeout: form.getFieldValue("hardTimeout"),
        timezone: form.getFieldValue("timezone"),
        validFrom: form.getFieldValue("_validFrom"),
        validUntil: form.getFieldValue("_validUntil"),
      };
      if (schedule) {
        result = await fetchApi(`/api/schedules/${schedule.id}`, "PATCH", data);
      } else {
        result = await fetchApi("/api/schedules/", "POST", data);
      }
      if (result) {
        notification(
          `Schedule ${schedule ? "updated" : "created"}`,
          undefined,
          "success",
          6
        );
        loadData();
      }
    };

    const updateRuleDetails = useCallback(
      (value: string): void => {
        try {
          setReadableRule(cronstrue.toString(value));
          const iterator = parseExpression(value, {
            tz: form.getFieldValue("timezone"),
          });
          const arr = [];
          for (let i = 0; i < 14; i++) {
            const next = iterator.next();
            arr.push(next.toDate().toUTCString());
          }
          setNextIterations(arr);
        } catch (error) {
          setReadableRule("Wrong rule!");
          setNextIterations([]);
        }
      },
      [form]
    );

    useEffect(() => {
      form.resetFields();
      let initialValues: Schedule;
      if (schedule) {
        if (!schedule.timezone) {
          schedule.timezone = defaultTimezone;
        }
        initialValues = schedule;
      } else {
        initialValues = {
          name: "",
          priority: defaultPriority,
          rule: "0 16 * * *",
          timezone: defaultTimezone,
          softTimeout: 86400000,
          hardTimeout: 86400000,
          validFrom: new Date(),
          validUntil: new Date("9999-12-31T00:00:00Z"),
        };
      }
      form.setFieldsValue(
        Object.assign({}, initialValues, {
          runtimeResourceId: initialValues.runtimeResource?.id,
          tasks: initialValues.scheduleTask?.map((scheduleTask) => {
            return {
              task: scheduleTask.task.id,
              delay: scheduleTask.delayAfter,
            };
          }),
          _validFrom: moment(initialValues.validFrom),
          _validUntil: moment(initialValues.validUntil),
        })
      );
      updateRuleDetails(initialValues.rule);
      setHasError(true);
    }, [schedule, form, defaultPriority, defaultTimezone, updateRuleDetails]);

    return (
      <CustomModal
        okFn={onOkHandler}
        okButtonName={schedule ? "Save" : "Create"}
        cancelButtonName="Cancel"
        ref={ref}
        width={1000}
        okButtonDisabled={hasError}
        key="AddOrEditScheduleModal"
      >
        <h3>Edit schedule</h3>
        <br />
        <Form
          form={form}
          onFieldsChange={(changedFields, fields) => {
            setHasError(
              form.getFieldsError().filter((field) => field.errors.length > 0)
                .length > 0
            );
            const _changedFields = changedFields.map(
              (field: any) => field.name[0]
            );
            if (
              _changedFields.includes("rule") ||
              _changedFields.includes("timezone")
            ) {
              updateRuleDetails(form.getFieldValue("rule"));
            }
          }}
          {...formSettings}
        >
          <Row>
            <Col span={14}>
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter schedule name" },
                ]}
              >
                <Input />
              </Form.Item>
              <Tooltip title="Priority 1 is the highest priority. Recommended priority setting is to use 10, 20, 30 ... instead of 1, 2, 3 ..., its easier to add a new schedule with priority in between.">
                <Form.Item
                  label="Priority"
                  name="priority"
                  rules={[
                    { required: true, message: "Please specify priority" },
                    {
                      pattern: /^[1-9]{1,}\d*$/,
                      message: "Must be a number greater than 0",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Tooltip>
              <Form.Item
                label="Valid from"
                name="_validFrom"
                rules={[{ required: true, message: "Please enter start date" }]}
              >
                <DatePicker showTime />
              </Form.Item>
              <Form.Item
                label="Valid until"
                name="_validUntil"
                rules={[{ required: true, message: "Please enter end date" }]}
              >
                <DatePicker showTime />
              </Form.Item>
              <Form.Item
                label="Machine"
                name="runtimeResourceId"
                rules={[
                  {
                    required: true,
                    message: "Please select runtime resource",
                  },
                ]}
              >
                <Select {...filterInSelect}>
                  {machines.map((machine) => {
                    if (machine.id) {
                      return (
                        <Select.Option value={machine.id} key={machine.id}>
                          {machine.friendlyName}
                        </Select.Option>
                      );
                    }
                    return null;
                  })}
                </Select>
              </Form.Item>
              <Tooltip title="Soft timeout means that a 'stop request' will be sent. Timeout is in milliseconds.">
                <Form.Item label="Soft timeout" name="softTimeout">
                  <Input />
                </Form.Item>
              </Tooltip>
              <Tooltip title="Hard timeout means that currently running task will be killed and job will be stopped. Timeout is in milliseconds.">
                <Form.Item label="Hard timeout" name="hardTimeout">
                  <Input />
                </Form.Item>
              </Tooltip>
              <Form.Item
                label="Rule timezone"
                name="timezone"
                rules={[
                  {
                    required: true,
                    message: "Please select timezone",
                  },
                ]}
              >
                <Select {...filterInSelect}>
                  {timezones.names.map((timezone) => {
                    return (
                      <Select.Option value={timezone} key={timezone}>
                        {timezone}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item label="Tasks">
                <Form.List name="tasks">
                  {(fields, { add, remove }) => {
                    return (
                      <div key="tasks-div">
                        {fields.map((field) => (
                          <div key={field.key}>
                            <Form.Item
                              key={`${field.key}-form-item`}
                              name={[field.name, "task"]}
                              style={{
                                display: "inline-block",
                                width: "calc(65%)",
                              }}
                            >
                              <Select
                                key={`${field.key}-select`}
                                {...filterInSelect}
                                placeholder="Start typing task name"
                              >
                                {tasks.map((task) => {
                                  if (task.id) {
                                    return (
                                      <Select.Option
                                        value={task.id}
                                        key={task.id}
                                      >
                                        {task.name}
                                      </Select.Option>
                                    );
                                  }
                                  return null;
                                })}
                              </Select>
                            </Form.Item>
                            <span
                              style={{
                                paddingLeft: "10px",
                                display: "inline-block",
                                width: "calc(15%)",
                              }}
                            >
                              Delay:
                            </span>
                            <Form.Item
                              key={`${field.key}-delay`}
                              name={[field.name, "delay"]}
                              style={{
                                display: "inline-block",
                                width: "calc(10%)",
                              }}
                              rules={[
                                {
                                  required: true,
                                  message: "Delay in seconds",
                                },
                                {
                                  pattern: /^\d{1,}$/,
                                  message: "Must be a number!",
                                },
                              ]}
                            >
                              <Input placeholder="sec" />
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
                            disabled={schedule ? false : true}
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
            </Col>
            <Col span={10}>
              <Tooltip title='Rule is a "cron" expression. --- Order: Minute, Hour, Day of month, Month, Day of week. --- Ranges (-): 0 4-8 * * * means run each hour between 4 and 8 AM, and 30 13 * * 1-5 means run 1:30 PM from Monday to Friday. --- Multiple (,): 0,30 6 * * * means run at 6 and 6:30 AM. --- Frequency (/): 0/15 * * * * means run every 15 minutes.'>
                <Form.Item
                  label="Rule"
                  name="rule"
                  rules={[{ required: true, message: "Please enter rule" }]}
                >
                  <Input />
                </Form.Item>
              </Tooltip>
              <Form.Item label="Rule translation">
                <p
                  style={{
                    marginTop: "2px",
                    marginBottom: "0px",
                    color: "gray",
                  }}
                >
                  {readableRule}
                </p>
              </Form.Item>
              <Form.Item
                label="Next iterations"
                // style={{ marginTop: "-16px" }}
              >
                {nextIterations.map((value) => (
                  <p
                    style={{
                      // fontSize: "12px",
                      marginBottom: "-2px",
                      marginTop: "2px",
                      color: "gray",
                    }}
                  >
                    {value}
                  </p>
                ))}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    );
  }
);

export default AddOrEditScheduleModal;
