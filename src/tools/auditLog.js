import { format } from "date-fns";
import fs from "fs";
import jsonExport from "jsonexport";

export default (type, data) => {
  let header = null;

  switch (type) {
    case "api":
      header = [
        "timestamp",
        "username",
        "method",
        "url",
        "body",
        "code", 
      ];
      break;

    case "authentication":
      header = [
        "timestamp",
        "username",
        "method",
        "action", 
      ];
      break;

    case "error":
      header = [
        "timestamp",
        "code",
        "status",
        "message", 
      ];
      break;
  }

  // make sure the audit folder exists
  const dirAduit = "./audit";
  if (!fs.existsSync(dirAduit)) {
    fs.mkdirSync(dirAduit);
  }

  // make sure the audit type exists
  const dirType = `${dirAduit}/${type}`;
  if (!fs.existsSync(dirType)) {
    fs.mkdirSync(dirType);
  }

  // see if the day files exists
  const file = `${dirType}/${format(new Date(), "yyyy-MM-dd")}.csv`;
  let includeHeader = true;
  if (fs.existsSync(file)) {
    includeHeader = false;
  }

  // append the log for today
  jsonExport(
    [ data ],
    {
      headers: header,
      includeHeaders: includeHeader,
    },
    (err, csv) => {
      if (err) {
        next(err);
      }

      const csvStream = fs.createWriteStream(file, { flags: "a" });
      csvStream.write(csv + "\n");
    },
  );
};