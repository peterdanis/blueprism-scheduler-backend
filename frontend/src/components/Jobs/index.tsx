import { Button, Space, Table, Tag } from "antd";
import Column from "antd/lib/table/Column";
import React, { useEffect, useRef, useState } from "react";
import fetchApi from "../../services/fetchApi";
import { idColumnWidth, tableSettings } from "../../utils/commonSettings";
import SearchBox from "../SearchBox";
import { StopOutlined } from "@ant-design/icons";
import ColumnGroup from "antd/lib/table/ColumnGroup";
import { Job, JobLog, RuntimeResource, Schedule } from "../../utils/types";
import catchAndNotify from "../../utils/catchAndNotify";
import DeleteModal from "../DeleteModal";

type modifiedJobLog = JobLog & {
  runtimeResource: RuntimeResource;
  schedule: Schedule;
};

const Jobs = () => {
  const [jobs, setJobs] = useState([] as Job[]);
  const [jobIds, setJobsIds] = useState("");
  const [jobLogs, setJobLogs] = useState([] as JobLog[]);
  const [filteredJobs, setFilteredJobs] = useState([] as Job[]);
  const [filteredJobLogs, setFilteredJobLogs] = useState([] as JobLog[]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingJobLogs, setIsLoadingJobLogs] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(0);
  const [schedules, setSchedules] = useState([] as Schedule[]);
  const [runtimeResources, setRuntimeResources] = useState(
    [] as RuntimeResource[]
  );

  // const AddUserModalRef = useRef<{ showModal: () => void }>(null);
  const deleteJobModalRef = useRef<{ showModal: () => void }>(null);

  const loadJobs = () => {
    setIsLoadingJobs(true);
    fetchApi("/api/jobs")
      .then((data: Job[]) => {
        setJobs(data);
        setIsLoadingJobs(false);
        if (data) {
          setJobsIds(data.reduce((acc, value) => `${acc};${value.id}`, ""));
        }
      })
      .catch(catchAndNotify);
  };

  const loadJobLogs = () => {
    setIsLoadingJobLogs(true);
    fetchApi("/api/jobLogs")
      .then((data: modifiedJobLog[]) => {
        const modifiedData = data.map((jobLog) => {
          jobLog.runtimeResource = runtimeResources.filter(
            (runtimeResource) => runtimeResource.id === jobLog.runtimeResourceId
          )[0];
          jobLog.schedule = schedules.filter(
            (schedule) => schedule.id === jobLog.scheduleId
          )[0];
          return jobLog;
        });
        setJobLogs(modifiedData.reverse());
        setIsLoadingJobLogs(false);
      })
      .catch(catchAndNotify);
  };

  const loadMiscData = () => {
    setIsLoadingJobLogs(true);
    loadJobs();
    const interval = setInterval(loadJobs, 10000);

    // Get schedules
    const schedulesPromise = fetchApi("/api/schedules").then((data) => {
      setSchedules(data);
    });

    // Get runtime resources
    const runtimeResourcesPromise = fetchApi("/api/runtimeResources").then(
      (data) => {
        setRuntimeResources(data);
      }
    );

    // Load schedule and runtime resource data first
    Promise.all([schedulesPromise, runtimeResourcesPromise]).catch(
      catchAndNotify
    );

    return () => clearInterval(interval);
  };

  useEffect(loadMiscData, [jobIds]);
  useEffect(loadJobLogs, [runtimeResources, schedules, jobIds]);

  const getMachineName = (record: Job) => {
    if (record.runtimeResource) {
      return record.runtimeResource.friendlyName;
    }
  };
  const getScheduleName = (record: Job) => {
    if (record.schedule) {
      return record.schedule.name;
    }
  };

  return (
    <>
      <DeleteModal
        id={selectedJobId || 0}
        route={"/api/jobs"}
        ref={deleteJobModalRef}
        loadData={loadJobs}
        customButtonName="Stop / Cancel"
        customNotificationText="Job stop / cancelation requested"
        customText="Request job stop / cancelation"
      />
      <Space direction="vertical" size="large">
        <SearchBox
          list={jobs}
          keys={[
            "id",
            "schedule.id",
            "schedule.name",
            "runtimeResource.id",
            "runtimeResource.friendlyName",
            "status",
          ]}
          placeholder="Search by schedule, machine, status..."
          resultsSetter={setFilteredJobs}
        />
        <Table
          dataSource={filteredJobs}
          rowKey={(record) => record.id!}
          loading={isLoadingJobs}
          {...tableSettings}
        >
          <ColumnGroup title="Job queue" align="left">
            <Column title="ID" dataIndex="id" width={idColumnWidth} />
            <Column title="Schedule" render={getScheduleName} />
            <Column
              title="Status"
              dataIndex="status"
              render={(status, record) => {
                let color: "success" | "default" | "error";
                switch (status) {
                  case "waiting":
                    color = "default";
                    break;
                  case "finished":
                    color = "success";
                    break;
                  case "running":
                    color = "success";
                    break;
                  case "failed":
                    color = "error";
                    break;

                  default:
                    color = "default";
                    break;
                }
                return (
                  <Tag color={color} key={`${record}-tag`}>
                    {status}
                  </Tag>
                );
              }}
            />
            <Column title="Machine" render={getMachineName} />
            <Column title="Priority" dataIndex="priority" />
            <Column
              title="Add time"
              render={(record) => {
                if (record.addTime) {
                  return record.addTime.replace("T", " ").replace(".000", "");
                }
              }}
            />
            <Column
              title="Start time"
              render={(record) => {
                if (record.startTime) {
                  return record.startTime.replace("T", " ").replace(".000", "");
                }
              }}
            />
            <Column
              title="Actions"
              dataIndex="actions"
              render={(_, record: Job) => (
                <>
                  <Space>
                    <Button
                      key={`${record.id}-stop`}
                      size="small"
                      type="primary"
                      danger
                      icon={<StopOutlined />}
                      onClick={(e) => {
                        setSelectedJobId(record.id!);
                        deleteJobModalRef?.current?.showModal();
                      }}
                    />
                  </Space>
                </>
              )}
            />
          </ColumnGroup>
        </Table>
        <SearchBox
          list={jobLogs}
          keys={[
            "jobId",
            "schedule.id",
            "schedule.name",
            "runtimeResource.id",
            "runtimeResource.friendlyName",
            "status",
          ]}
          placeholder="Search by job ID, schedule, machine, status..."
          resultsSetter={setFilteredJobLogs}
        />
        <Table
          dataSource={filteredJobLogs}
          rowKey={(record: any) => record.id}
          loading={isLoadingJobLogs}
          {...tableSettings}
        >
          <ColumnGroup title="Job log" align="left">
            <Column title="ID" dataIndex="jobId" width={idColumnWidth} />
            {/* <Column
              title="Schedule"
              render={({ scheduleId }) =>
                schedules.filter((schedule) => schedule.id === scheduleId)[0]
                  .name
              }
            /> */}
            <Column title="Schedule" render={getScheduleName} />
            <Column
              title="Status"
              dataIndex="status"
              render={(status, record) => {
                let color: "success" | "default" | "error" | "processing";
                switch (status) {
                  case "waiting":
                    color = "default";
                    break;
                  case "finished":
                    color = "success";
                    break;
                  case "running":
                    color = "processing";
                    break;
                  case "failed":
                    color = "error";
                    break;

                  default:
                    color = "default";
                    break;
                }
                return (
                  <Tag color={color} key={`${record}-tag`}>
                    {status}
                  </Tag>
                );
              }}
            />
            <Column title="Machine" render={getMachineName} />
            <Column title="Priority" dataIndex="priority" />
            <Column title="Message" dataIndex="message" />
            <Column
              title="Add time"
              render={(record) => {
                if (record.addTime) {
                  return record.addTime.replace("T", " ").replace(".000", "");
                }
              }}
            />
            <Column
              title="Start time"
              render={(record) => {
                if (record.startTime) {
                  return record.startTime.replace("T", " ").replace(".000", "");
                }
              }}
            />
            <Column
              title="End time"
              render={(record) => {
                if (record.endTime) {
                  return record.endTime.replace("T", " ").replace(".000", "");
                }
              }}
            />
          </ColumnGroup>
        </Table>
      </Space>
    </>
  );
};

export default Jobs;
