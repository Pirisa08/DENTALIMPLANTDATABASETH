import React, { useMemo, useState } from "react";
import "./Profile.css";
import AdminSearchBar from "../components/AdminSearchBar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CustomSelect from "../components/CustomSelect.jsx";

const PROFILE_KEY = "admin_profile_v1";

const defaultProfile = {
  fullName: "Minny Micky",
  role: "Admin",
  jobTitle: "Dental",
  profileImage: "",
};

const ROLE_OPTIONS = ["Admin", "Editor", "Distributor"];
const JOB_OPTIONS = ["Dentist", "Dental", "Marketing"];

function loadProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  }
  try {
    const obj = JSON.parse(raw);
    return { ...defaultProfile, ...(obj || {}) };
  } catch {
    return defaultProfile;
  }
}

export default function Profile() {
  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState(loadProfile());

  const canSave = useMemo(() => profile.role && profile.jobTitle, [profile]);

  const save = () => {
    if (!canSave) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setEdit(false);
  };

  // Save image to localStorage whenever it changes
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = String(reader.result || "");
        setProfile((p) => ({ ...p, profileImage: imageData }));
        // Save immediately to localStorage
        const updated = { ...profile, profileImage: imageData };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pfWrap">
      <AdminSearchBar
        placeholder="Search…"
        value=""
        onChangeQ={() => {}}
        onSearch={() => {}}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/admin" },
          { label: "Profile" },
        ]}
      />

      <h2 className="pageTitle">👤 My Profile</h2>

      <div className="pfCard">
        <button className="pfEdit" onClick={() => setEdit(true)} type="button">
          ✎ <span>Edit</span>
        </button>

        <div className="pfAvatar">
          <label className={`pfImageUpload ${!edit ? "pfImageDisabled" : ""}`}>
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="profile" className="pfImg" />
            ) : (
              <div className="pfCircle">
                <span>📷</span>
              </div>
            )}
            {edit && (
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            )}
          </label>
        </div>

        <div className="pfLabel">Name &nbsp;Surname</div>
        <div className="pfName">{profile.fullName}</div>

        {!edit ? (
          <>
            <div className="pfGroup">
              <div className="pfSmallLabel">Role</div>
              <div className="pfValue">{profile.role}</div>
            </div>

            <div className="pfGroup">
              <div className="pfSmallLabel">Job Title</div>
              <div className="pfValue">{profile.jobTitle}</div>
            </div>
          </>
        ) : (
          <>
            <div className="pfEditRow">
              <div className="pfField">
                <div className="pfSmallLabel">Role</div>
                <CustomSelect
                  value={profile.role}
                  onChange={(val) => setProfile((p) => ({ ...p, role: val }))}
                  options={ROLE_OPTIONS}
                  placeholder="Select role"
                />
              </div>

              <div className="pfField">
                <div className="pfSmallLabel">Job Title</div>
                <CustomSelect
                  value={profile.jobTitle}
                  onChange={(val) => setProfile((p) => ({ ...p, jobTitle: val }))}
                  options={JOB_OPTIONS}
                  placeholder="Select job title"
                />
              </div>
            </div>

            <button className="pfSave" onClick={save} disabled={!canSave}>
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}
