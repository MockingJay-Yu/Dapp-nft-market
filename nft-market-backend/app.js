import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./uploadToIPFS.js";
import { mint } from "./nft-minter.js";
import "dotenv/config";
import cors from "cors";

const app = express();
const port = 3000;

//使用ejs模板
app.set("view engine", "ejs");
// 解析 application/json
app.use(bodyParser.json());
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// 使用fileUpload上传文件
app.use(fileUpload());
//跨域
app.use(cors());

//主页
app.get("/", (req, res) => {
  res.render("home");
});

//上传文件生成NFT
app.post("/upload", (req, res) => {
  //接收前端参数
  const title = req.body.title;
  const description = req.body.description;
  const file = req.files.file;
  const address = req.body.address;
  const fileName = file.name;
  //保存文件到本地
  const filePath = "files/" + fileName;
  file.mv(filePath, async (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("upload file error");
    }
    //上传文件到IPFS并生成CID
    const fileResult = await uploadFileToIPFS(filePath);
    const fileCid = fileResult.cid.toString();
    console.log(fileCid);
    //上传元数据到IPFS生成元数据的CID
    const metadata = {
      title: title,
      description: description,
      image: process.env.PREFIX_OF_CID + fileCid,
    };
    const metadataResult = await uploadJSONToIPFS(metadata);
    const metadataCid = metadataResult.cid.toString();
    //调用合约，传入用户地址和元数据CID，在合约上生成NFT
    await mint(address, process.env.PREFIX_OF_CID + metadataCid);
    //返回NFT信息
    res.json({
      message: "Your NFT has been generated",
      data: metadata,
    });
  });
});

app.listen(port, () => {
  console.log("express app is listening.....");
});
