const menus = [
  {id: '0', label: '控制面板', path: '/', icon: 'fa fa-dashboard'},
  {
    id: 'user',
    icon: 'fa fa-circle-o',
    label: '用户管理',
    name: 'user-manager'
  },
  {
    id: 'work',
    icon: 'fa fa-circle-o',
    label: '作品管理',
    name: 'work-manager'
  },
  {
    id: 'exhibition',
    icon: 'fa fa-circle-o',
    label: '画展',
    submenu: [
      {id: 'exhibition-manager', name: 'exhibition-manager', label: '画展管理'},
      {id: 'exhibition-work-manager', name: 'exhibition-work-manager', label: '画展作品管理'}
    ]
  },
  {
    id: 'course',
    icon: 'fa fa-circle-o',
    label: '教程管理',
    name: 'course-manager'
  },
  {
    id: 'carousel',
    icon: 'fa fa-circle-o',
    label: '轮播管理',
    name: 'carousel-manager'
  }

]
export default menus
