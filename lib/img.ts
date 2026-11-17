/** Curated Unsplash library (see DESIGN.md › Imagery). Every id was checked to load and to match its label. */
export const photos = {
  skylineDusk: "1512453979798-5ea266f8880c", // Sheikh Zayed Road at dusk, Dubai
  skylineNight: "1526495124232-a04e1849168c", // Downtown Dubai lights at night
  downtownDay: "1580674684081-7617fbf3d745", // Burj Khalifa with palms, Downtown Dubai
  burjNight: "1597659840241-37e2b9c2f55f", // Burj Khalifa facade, night
  museumFuture: "1546412414-8035e1776c9a", // Museum of the Future, Sheikh Zayed Road
  marinaCamels: "1528702748617-c64d49f918af", // Dubai Marina towers with camels
  palmAerial: "1489516408517-0c0a15662682", // Palm Jumeirah, aerial
  burjAlArabAerial: "1518684079-3c830dcef090", // Burj Al Arab, aerial
  burjAlArab: "1546412414-e1885259563a", // Burj Al Arab from the beach
  grandMosque: "1512632578888-169bbbc64f33", // Sheikh Zayed Grand Mosque, Abu Dhabi
  beach: "1507525428034-b723cf961d3e", // Gulf beach at sunset
  towerAbstract: "1572883454114-1cf0031ede2a", // glass tower, looking up
  villaPool: "1613490493576-7fde63acd811", // white modern villa with pool
  villaWhite: "1613977257363-707ba9348227", // white villa, garden pool
  villaSea: "1600596542815-ffad4c1539a9", // villa pool over the sea
  villaDusk: "1600585154340-be6161a56a0c", // contemporary villa at dusk
  villaClassic: "1564013799919-ab600027ffc6", // villa with pool and palms
  interiorLiving: "1600607687939-ce8a6c25118c", // bright open-plan living room
  interiorDining: "1604014237800-1c9102c219da", // living and dining, wood and stone
  interiorLounge: "1600210492486-724fe5c67fb0", // lounge with gallery wall
  interiorDark: "1606744824163-985d376605aa", // dark lounge chair interior
  dealHighFive: "1600880292203-757bb62b4baf", // two colleagues celebrating at a desk
  handshake: "1521791136064-7986c2920216", // handshake over a desk
  agentWoman: "1590650153855-d9e808231d41", // professional woman at a desk
  agentPortrait: "1573497019940-1c28c88b4f3e", // smiling businesswoman portrait
  execPortrait: "1560250097-0b93528c311a", // businessman portrait
  teamMeeting: "1552664730-d307ca884978", // team planning session
} as const;

export type PhotoKey = keyof typeof photos;

export function img(key: PhotoKey, w = 1600, extra = "") {
  return `https://images.unsplash.com/photo-${photos[key]}?w=${w}&q=80&auto=format&fit=crop${extra}`;
}
