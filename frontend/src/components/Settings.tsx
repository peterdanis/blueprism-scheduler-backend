import React from "react";
import { version } from "../../package.json";

const Settings = () => {
  return (
    <div>
      <p>Web app version: {version}</p>
      <div>
        Icons made by{" "}
        <a href="https://www.flaticon.com/authors/xnimrodx" title="xnimrodx">
          xnimrodx
        </a>{" "}
        from{" "}
        <a href="https://www.flaticon.com/" title="Flaticon">
          www.flaticon.com
        </a>
      </div>
    </div>
  );
};

export default Settings;
