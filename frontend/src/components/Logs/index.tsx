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

const Logs = () => {
  const [logs, setLogs] = useState([]);

  // const AddUserModalRef = useRef<{ showModal: () => void }>(null);
  // const DeleteUserModalRef = useRef<{ showModal: () => void }>(null);

  // const loadJobs = () => {
  //   setIsLoadingJobs(true);
  //   fetchApi("/api/jobs")
  //     .then((data: Job[]) => {
  //       setLogs(data);
  //       setIsLoadingJobs(false);
  //       if (data) {
  //         setJobsIds(data.reduce((acc, value) => `${acc};${value.id}`, ""));
  //       }
  //     })
  //     .catch(catchAndNotify);
  // };

  // const loadMiscData = () => {
  //   setIsLoadingJobLogs(true);
  //   loadJobs();
  //   const interval = setInterval(loadJobs, 10000);

  //   // Get schedules
  //   const schedulesPromise = fetchApi("/api/schedules").then((data) => {
  //     setSchedules(data);
  //   });

  //   // Get runtime resources
  //   const runtimeResourcesPromise = fetchApi("/api/runtimeResources").then(
  //     (data) => {
  //       setRuntimeResources(data);
  //     }
  //   );

  //   // Load schedule and runtime resource data first
  //   Promise.all([schedulesPromise, runtimeResourcesPromise]).catch(
  //     catchAndNotify
  //   );

  //   return () => clearInterval(interval);
  // };

  // useEffect(loadMiscData, [jobIds]);
  // useEffect(loadJobLogs, [runtimeResources, schedules, jobIds]);

  // const getMachineName = (record: Job) => {
  //   if (record.runtimeResource) {
  //     return record.runtimeResource.friendlyName;
  //   }
  // };
  // const getScheduleName = (record: Job) => {
  //   if (record.schedule) {
  //     return record.schedule.name;
  //   }
  // };

  return (
    <>
      <p>Logs</p>
    </>
  );
};

export default Logs;
