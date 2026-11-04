export interface Solution {
  name: string;
  desc: string;
}

export interface Area {
  id: string;
  title: string;
  icon: string;
  bgIcon: string;
  colorIcon: string;
  bgCard: string;
  badgeBg: string;
  badgeColor: string;
  desc: string;
  itemBg: string;
  solutions: Solution[];
}

