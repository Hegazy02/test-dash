"use client";
import React from "react";
import { useState, useEffect } from "react";

interface LinkType {
  _id: string;
  link: string;
  name: string;
  counter?: number;
}

export default function LinkPage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [formData, setFormData] = useState({
    link: "",
    name: "",
  });
  const [randomName, setRandomName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ link: string; name: string }>({
    link: "",
    name: "",
  });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function generateRandomName(length = 10) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  useEffect(() => {
    setRandomName(generateRandomName());
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/link/link");
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToUse = formData.name.trim() !== "" ? formData.name : randomName;
    try {
      const response = await fetch("/api/link/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, name: nameToUse }),
      });
      if (response.ok) {
        setFormData({ link: "", name: "" });
        setRandomName(generateRandomName());
        fetchLinks();
        setErrorMsg(null);
      } else if (response.status === 409) {
        setErrorMsg("Name already exists. Please choose a unique name.");
      }
    } catch (error) {
      console.error("Error creating shortcut:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/link/link?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchLinks();
      }
    } catch (error) {
      console.error("Error deleting shortcut:", error);
    }
  };

  const handleEdit = (link: LinkType) => {
    setEditId(link._id);
    setEditData({ link: link.link, name: link.name });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id: string) => {
    try {
      const response = await fetch(`/api/link/link?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setEditId(null);
        setEditData({ link: "", name: "" });
        fetchLinks();
        setErrorMsg(null);
      } else if (response.status === 409) {
        setErrorMsg("Name already exists. Please choose a unique name.");
      }
    } catch (error) {
      console.error("Error updating shortcut:", error);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditData({ link: "", name: "" });
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(url);
      setTimeout(() => setCopySuccess(null), 1500);
    } catch (err) {
      setCopySuccess(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-start  px-4 sm:px-6 lg:px-8 pt-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white text-center">
        Links ShortCut
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-md mb-8"
      >
        {errorMsg && (
          <div className="text-red-500 text-sm mb-2">{errorMsg}</div>
        )}
        <input
          type="text"
          placeholder="Link"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          className="p-3 sm:p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-sm sm:text-base"
        />
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="p-3 sm:p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-sm sm:text-base"
        />
        <button
          type="submit"
          className="p-3 sm:p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 text-sm sm:text-base"
        >
          Submit
        </button>
      </form>
      <div className="w-full max-w-2xl">
        {links.map((link) => {
          const shortcutUrl = `https://www.darbproductions.com/link/${link.name}`;
          return (
            <div
              key={link._id}
              className="flex items-center justify-between p-4 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                {editId === link._id ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="mb-1 p-1 border rounded w-full text-sm"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      name="link"
                      value={editData.link}
                      onChange={handleEditChange}
                      className="mb-1 p-1 border rounded w-full text-sm"
                      placeholder="Link"
                    />
                    <div className="flex gap-2 mb-1">
                      <button
                        onClick={() => handleEditSave(link._id)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-2 py-1 bg-gray-400 text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {link.name}
                    </h3>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      {link.link}
                    </a>
                    <div className="flex items-center gap-2">
                      <a
                        href={shortcutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm block"
                      >
                        {shortcutUrl}
                      </a>
                      <button
                        onClick={() => handleCopy(shortcutUrl)}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        type="button"
                      >
                        {copySuccess === shortcutUrl ? "Copied!" : "Copy Link"}
                      </button>
                      {typeof link.counter === "number" && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">{link.counter} views</span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {editId !== link._id && (
                  <button
                    onClick={() => handleEdit(link)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(link._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
