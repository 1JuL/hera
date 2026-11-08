export interface Solution {
  name: string;
  desc: string;
}

export interface Area {
  id: string;
  title: string;
  iconName: 'Zap' | 'Users' | 'ShoppingBag' | 'Factory' | 'FolderKanban' | 'Truck';
  bgIcon: string;
  colorIcon: string;
  bgCard: string;
  badgeBg: string;
  badgeColor: string;
  desc: string;
  itemBg: string;
  solutions: Solution[];
}
