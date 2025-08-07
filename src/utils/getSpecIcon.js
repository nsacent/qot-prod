const getSpecIcon = (fieldName) => {
  const name = fieldName.toLowerCase();

  if (name.includes("brand")) return "industry";
  if (name.includes("car")) return "car";
  if (name.includes("model")) return "cubes";
  if (name.includes("year")) return "calendar";
  if (name.includes("mileage")) return "tachometer";
  if (name.includes("fuel")) return "tint";
  if (name.includes("feature")) return "star";
  if (name.includes("transmission")) return "cogs";
  if (name.includes("condition")) return "wrench";
  if (name.includes("size")) return "expand";
  if (name.includes("rooms")) return "bed";
  if (name.includes("building")) return "building";
  if (name.includes("parking")) return "parking";
  if (name.includes("furnished")) return "couch";
  if (name.includes("mobile")) return "mobile";
  if (name.includes("electronic")) return "plug";
  if (name.includes("start date")) return "play-circle";
  if (name.includes("end date")) return "stop-circle";
  if (name.includes("date range")) return "calendar-check-o";
  if (name.includes("company")) return "briefcase";
  if (name.includes("work type")) return "user-clock";
  if (name.includes("event address")) return "map-marker";
  if (name.includes("website")) return "globe";
  if (name.includes("video")) return "video-camera";

  return "info-circle";
};

export default getSpecIcon;
