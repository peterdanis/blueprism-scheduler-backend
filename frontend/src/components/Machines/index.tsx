import { Button, Space, Table } from "antd";
import Column from "antd/lib/table/Column";
import React, { useEffect, useRef, useState } from "react";
import fetchApi from "../../services/fetchApi";
import { idColumnWidth, tableSettings } from "../../utils/commonSettings";
import SearchBox from "../SearchBox";
import { EditOutlined } from "@ant-design/icons";
import AddMachineModal from "./AddMachineModal";
import { RuntimeResource } from "../../utils/types";
import catchAndNotify from "../../utils/catchAndNotify";

const Machines = () => {
  const [machines, setMachines] = useState([] as RuntimeResource[]);
  const [filteredMachines, setFilteredMachines] = useState(
    [] as RuntimeResource[]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(0);

  const AddMachineModalRef = useRef<{ showModal: () => void }>(null);
  // const DeleteUserModalRef = useRef<{ showModal: () => void }>(null);

  const loadData = () => {
    setIsLoading(true);
    fetchApi("/api/runtimeResources")
      .then((data) => {
        setIsLoading(false);
        setMachines(data);
      })
      .catch(catchAndNotify);
  };

  useEffect(loadData, []);

  return (
    <>
      <AddMachineModal loadData={loadData} ref={AddMachineModalRef} />
      {/* <DeleteModal
        id={selectedJobId}
        route={"/api/users"}
        ref={DeleteUserModalRef}
        loadData={loadData}
      /> */}
      <Space direction="vertical" size="large">
        <Button
          type="primary"
          onClick={() => {
            AddMachineModalRef?.current?.showModal();
          }}
        >
          Add new machine
        </Button>
        <SearchBox
          list={machines}
          keys={["id", "friendlyName", "hostname"]}
          placeholder="Search by ID, name, hostname..."
          resultsSetter={setFilteredMachines}
        />
        <Table
          dataSource={filteredMachines}
          rowKey={(record) => record.id!}
          loading={isLoading}
          {...tableSettings}
        >
          <Column title="ID" dataIndex="id" width={idColumnWidth} />
          <Column title="Name" dataIndex="friendlyName" />
          <Column title="Hostname" dataIndex="hostname" />
          <Column title="Port" dataIndex="port" />
          <Column title="Using HTTPS" dataIndex="https" />

          <Column
            title="Actions"
            dataIndex="actions"
            render={(_, record: RuntimeResource) => (
              <>
                <Space>
                  <Button
                    disabled
                    key={`${record.id}-delete`}
                    size="small"
                    danger
                    type={"primary"}
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      setSelectedMachine(record.id!);
                      // DeleteUserModalRef?.current?.showModal();
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

export default Machines;
