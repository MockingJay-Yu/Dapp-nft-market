import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../UploadImage.css";

// 定义FileUploadForm组件
function UploadImage({ address }) {
  // 使用useState Hook来管理表单状态
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 处理表单提交
  const handleSubmit = async (event) => {
    event.preventDefault(); // 阻止表单的默认提交行为

    if (fileInputRef.current.files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    const formdata = new FormData();
    formdata.append("title", title);
    formdata.append("description", description);
    formdata.append("file", fileInputRef.current.files[0]);
    formdata.append("address", address);

    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/upload",
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("File uploaded successfully", response.data);
      navigate("/success");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // 渲染表单
  return (
    <div className="upload-container">
      <h1>Upload Image to IPFS and Mint NFT</h1>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          placeholder="Enter image title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          placeholder="Description your image"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label htmlFor="file">Image*</label>
        <input type="file" id="file" ref={fileInputRef} required />
        <div className="buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button type="submit" className="upload-button">
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadImage;
