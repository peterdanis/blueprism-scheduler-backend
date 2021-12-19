import React, { forwardRef } from "react";
import CustomModal from "../CustomModal";
import fetchApi from "../../services/fetchApi";
import notification from "../../utils/notification";

type Props = {
  id: number;
  loadData: () => void;
};

const createMessage = (key: string) => {
  return (
    <>
      <p>
        After this notification will be closed there will be no way how to get
        this key. Please copy the key now.
      </p>
      <p>Key:</p>
      <p>{key}</p>
    </>
  );
};

const GenerateApiKeyModal = forwardRef(({ id, loadData }: Props, ref) => {
  const onOkHandler = async () => {
    const url = `/api/users/${id}/apikey`;
    const result = await fetchApi(url, "POST");
    if (result && result.apiKey) {
      notification(
        "New API key generated",
        createMessage(result.apiKey),
        "success"
      );
      loadData();
    } else {
      console.log(result);
      notification("API key generation failed", undefined, "error");
    }
  };

  return (
    <CustomModal
      key="GenearateApiKeyModal"
      okFn={onOkHandler}
      okButtonName="Generate"
      cancelButtonName="Cancel"
      ref={ref}
    >
      <h3>Confirm generating new API key</h3>
      <p>
        When new key is generated the old key (if exists) will stop working!
      </p>
    </CustomModal>
  );
});

export default GenerateApiKeyModal;
