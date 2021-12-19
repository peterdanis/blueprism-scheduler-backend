import { Button, Space, Table } from "antd";
import Column from "antd/lib/table/Column";
import React, { useEffect, useRef, useState } from "react";
import fetchApi from "../../services/fetchApi";
import SearchBox from "../SearchBox";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { idColumnWidth, tableSettings } from "../../utils/commonSettings";
import { Task } from "../../utils/types";
import catchAndNotify from "../../utils/catchAndNotify";
import AddOrEditTaskModal from "./AddOrEditTaskModal";
import DeleteModal from "../DeleteModal";
import moment from "moment";

const Tasks = () => {
  const [tasks, setTasks] = useState([] as Task[]);
  const [filteredTasks, setFilteredTasks] = useState([] as Task[]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(
    undefined as Task | undefined
  );

  const addOrEditTaskModalRef = useRef<{ showModal: () => void }>(null);
  const deleteTaskModalRef = useRef<{ showModal: () => void }>(null);

  const loadData = () => {
    setIsLoading(true);
    fetchApi("/api/tasks")
      .then((data) => {
        setIsLoading(false);
        setTasks(data);
      })
      .catch(catchAndNotify);
  };

  useEffect(loadData, []);

  return (
    <>
      <AddOrEditTaskModal
        loadData={loadData}
        task={selectedTask}
        ref={addOrEditTaskModalRef}
      />
      <DeleteModal
        id={selectedTask?.id || 0}
        route={"/api/tasks"}
        ref={deleteTaskModalRef}
        loadData={loadData}
      />
      <Space direction="vertical" size="large">
        <Button
          type="primary"
          onClick={() => {
            setSelectedTask(undefined);
            addOrEditTaskModalRef?.current?.showModal();
          }}
        >
          Add new task
        </Button>
        <SearchBox
          list={tasks}
          keys={["id", "name", "process"]}
          placeholder="Search by ID, task or process name"
          resultsSetter={setFilteredTasks}
        />
        <Table
          dataSource={filteredTasks}
          rowKey={(record) => record.id!}
          loading={isLoading}
          {...tableSettings}
        >
          <Column title="ID" dataIndex="id" width={idColumnWidth} />
          <Column title="Name" dataIndex="name" />
          <Column title="Process" dataIndex="process" />
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
            render={(_, record: Task) => (
              <>
                <Space>
                  <Button
                    key={`${record.id}-edit`}
                    size="small"
                    type={"primary"}
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      setSelectedTask(record);
                      addOrEditTaskModalRef?.current?.showModal();
                    }}
                  />
                  <Button
                    key={`${record.id}-delete`}
                    size="small"
                    danger
                    type={"primary"}
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      setSelectedTask(record);
                      deleteTaskModalRef?.current?.showModal();
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

export default Tasks;
