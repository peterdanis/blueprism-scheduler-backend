import { Button, Space, Table } from "antd";
import Column from "antd/lib/table/Column";
import React, { useEffect, useRef, useState } from "react";
import fetchApi from "../../services/fetchApi";
import { idColumnWidth, tableSettings } from "../../utils/commonSettings";
import SearchBox from "../SearchBox";
import {
  DeleteOutlined,
  EditOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import AddOrEditScheduleModal from "./AddOrEditScheduleModal";
import { RuntimeResource, Schedule, Setting, Task } from "../../utils/types";
import catchAndNotify from "../../utils/catchAndNotify";
import DeleteModal from "../DeleteModal";
import moment from "moment";
import RunModal from "./RunModal";

const Schedules = () => {
  const [schedules, setSchedules] = useState([] as Schedule[]);
  const [machines, setMachines] = useState([] as RuntimeResource[] | undefined);
  const [tasks, setTasks] = useState([] as Task[] | undefined);
  const [settings, setSettings] = useState([] as Setting[] | undefined);

  const [filteredSchedules, setFilteredSchedules] = useState([] as Schedule[]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(
    undefined as Schedule | undefined
  );

  const addOrEditScheduleModalRef = useRef<{ showModal: () => void }>(null);
  const deleteScheduleModalRef = useRef<{ showModal: () => void }>(null);
  const runModalRef = useRef<{ showModal: () => void }>(null);

  const loadData = () => {
    setIsLoading(true);

    const runtimeResourcesPromise = fetchApi("/api/runtimeResources").then(
      (data: RuntimeResource[]) => {
        if (Array.isArray(data)) {
          setMachines(
            data.sort((a, b) =>
              a.friendlyName.toLowerCase() < b.friendlyName.toLowerCase()
                ? -1
                : 1
            )
          );
        }
      }
    );

    const tasksPromise = fetchApi("/api/tasks").then((data: Task[]) => {
      if (Array.isArray(data)) {
        setTasks(
          data.sort((a, b) =>
            a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
          )
        );
      }
    });

    const settingsPromise = fetchApi("/api/settings").then(
      (data: Setting[]) => {
        if (Array.isArray(data)) {
          setSettings(data);
        }
      }
    );

    const schedulesPromise = fetchApi("/api/schedules").then((data) => {
      setSchedules(data);
      setIsLoading(false);
    });

    Promise.all([
      schedulesPromise,
      runtimeResourcesPromise,
      tasksPromise,
      settingsPromise,
    ]).catch(catchAndNotify);
  };

  useEffect(loadData, []);

  return (
    <>
      <AddOrEditScheduleModal
        defaultPriority={
          (settings?.filter((setting) => setting.key === "defaultPriority")[0]
            ?.value as unknown) as number
        }
        defaultTimezone={
          settings?.filter((setting) => setting.key === "defaultTimezone")[0]
            ?.value as string
        }
        loadData={loadData}
        schedule={selectedSchedule}
        machines={machines || []}
        tasks={tasks || []}
        ref={addOrEditScheduleModalRef}
      />
      <DeleteModal
        id={selectedSchedule?.id || 0}
        route={"/api/schedules"}
        ref={deleteScheduleModalRef}
        loadData={loadData}
      />
      <RunModal id={selectedSchedule?.id || 0} ref={runModalRef} />
      <Space direction="vertical" size="large">
        <Button
          type="primary"
          onClick={() => {
            setSelectedSchedule(undefined);
            addOrEditScheduleModalRef?.current?.showModal();
          }}
        >
          Add new schedule
        </Button>
        <SearchBox
          list={schedules}
          keys={["id", "name", "runtimeResource.friendlyName"]}
          placeholder="Search by ID, name, machine..."
          resultsSetter={setFilteredSchedules}
        />
        <Table
          dataSource={filteredSchedules}
          rowKey={(record) => record.id!}
          loading={isLoading}
          {...tableSettings}
        >
          <Column title="ID" dataIndex="id" width={idColumnWidth} />
          <Column title="Name" dataIndex="name" />
          <Column
            title="Machine"
            render={(record) => record.runtimeResource.friendlyName}
          />
          <Column title="Priority" dataIndex="priority" />
          <Column
            title="Timezone"
            render={(record) =>
              record.timezone ||
              (settings?.filter(
                (setting) => setting.key === "defaultTimezone"
              )[0]?.value as string)
            }
          />
          <Column
            title="Valid from"
            render={(record) =>
              record.validFrom.replace("T", " ").replace(".000", "")
            }
          />
          <Column
            title="Valid until"
            render={(record) =>
              record.validUntil.replace("T", " ").replace(".000", "")
            }
          />
          <Column
            title="Soft timeout"
            render={(record) => {
              if (record.softTimeout) {
                return `${moment
                  .duration(record.softTimeout)
                  .days()}d ${moment.duration(record.softTimeout).hours()}h
                  ${moment.duration(record.softTimeout).minutes()}m`;
              }
            }}
          />
          <Column
            title="Hard timeout"
            render={(record) => {
              if (record.hardTimeout) {
                return `${moment
                  .duration(record.hardTimeout)
                  .days()}d ${moment.duration(record.hardTimeout).hours()}h
                  ${moment.duration(record.hardTimeout).minutes()}m`;
              }
            }}
          />
          <Column
            title="Actions"
            dataIndex="actions"
            render={(_, record: Schedule) => (
              <>
                <Space>
                  <Button
                    key={`${record.id}-run`}
                    size="small"
                    type={"primary"}
                    icon={<CaretRightOutlined />}
                    onClick={(e) => {
                      setSelectedSchedule(record);
                      runModalRef?.current?.showModal();
                    }}
                  >
                    Run
                  </Button>
                  <Button
                    key={`${record.id}-edit`}
                    size="small"
                    type={"primary"}
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      setSelectedSchedule(record);
                      addOrEditScheduleModalRef?.current?.showModal();
                    }}
                  />
                  <Button
                    key={`${record.id}-delete`}
                    size="small"
                    danger
                    type={"primary"}
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      setSelectedSchedule(record);
                      deleteScheduleModalRef?.current?.showModal();
                    }}
                  />
                </Space>
              </>
            )}
          />
        </Table>
      </Space>
    </>
  );
};

export default Schedules;
