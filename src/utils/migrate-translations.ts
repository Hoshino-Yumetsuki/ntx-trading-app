/**
 * 翻译系统迁移工具
 * 用于将旧的翻译键迁移到新的翻译系统
 */

// 旧翻译键到新翻译键的映射
export const translationKeyMigrationMap: Record<string, string> = {
  // 通用
  'common.loading': 'common.loading',
  'common.error': 'common.error',
  'common.success': 'common.success',
  'common.cancel': 'common.cancel',
  'common.confirm': 'common.confirm',
  'common.save': 'common.save',

  // 认证
  'auth.login': 'auth.login',
  'auth.logout': 'auth.logout',
  'auth.register': 'auth.register',
  'auth.username': 'auth.username',
  'auth.password': 'auth.password',
  'auth.confirmPassword': 'auth.confirmPassword',
  'auth.forgotPassword': 'auth.forgotPassword',
  'auth.loginSuccess': 'auth.loginSuccess',
  'auth.logoutSuccess': 'auth.logoutSuccess',
  'auth.loginFailed': 'auth.loginFailed',
  'auth.registerSuccess': 'auth.registerSuccess',
  'auth.registerFailed': 'auth.registerFailed',

  // 安全设置
  'security.changePassword': 'security.changePassword',
  'security.oldPassword': 'security.oldPassword',
  'security.newPassword': 'security.newPassword',
  'security.confirmNewPassword': 'security.confirmNewPassword',
  'security.passwordChanged': 'security.passwordChanged',
  'security.passwordChangeFailed': 'security.passwordChangeFailed',
  'security.nickname.change': 'security.nickname.change',
  'security.nickname.placeholder': 'security.nickname.placeholder',

  // 挖矿
  'mining.title': 'mining.title',
  'mining.subtitle': 'mining.subtitle',
  'mining.tabs.data': 'mining.tabs.data',
  'mining.tabs.exchange': 'mining.tabs.exchange',
  'mining.data.title': 'mining.data.title',

  // 平台数据
  'mining.platform.title': 'mining.platform.title',
  'mining.platform.totalDataTitle': 'mining.platform.totalDataTitle',
  'mining.platform.dailyDataTitle': 'mining.platform.dailyDataTitle',
  'mining.platform.updateTime': 'mining.platform.updateTime',
  'mining.platform.totalMined': 'mining.platform.totalMined',
  'mining.platform.totalCommission': 'mining.platform.totalCommission',
  'mining.platform.totalBurned': 'mining.platform.totalBurned',
  'mining.platform.totalVolume': 'mining.platform.totalVolume',
  'mining.platform.totalUsers': 'mining.platform.totalUsers',
  'mining.platform.users': 'mining.platform.users',

  // 用户数据
  'mining.user.title': 'mining.user.title',
  'mining.user.loginPrompt': 'mining.user.loginPrompt',
  'mining.user.loginDescription': 'mining.user.loginDescription',
  'mining.user.totalMining': 'mining.user.totalMining',
  'mining.user.totalTradingCost': 'mining.user.totalTradingCost',
  'mining.user.dailyMining': 'mining.user.dailyMining',
  'mining.user.dailyTradingCost': 'mining.user.dailyTradingCost',

  // 日数据
  'mining.daily.selectDate': 'mining.daily.selectDate',
  'mining.daily.miningOutput': 'mining.daily.miningOutput',
  'mining.daily.commission': 'mining.daily.commission',
  'mining.daily.burned': 'mining.daily.burned',
  'mining.daily.tradingVolume': 'mining.daily.tradingVolume',
  'mining.daily.miners': 'mining.daily.miners',

  // 交易所
  'mining.exchange.title': 'mining.exchange.title',
  'mining.exchanges.title': 'mining.exchanges.title',
  'mining.exchange.efficiency': 'mining.exchange.efficiency',
  'mining.exchange.bind': 'mining.exchange.bind',
  'mining.exchange.unbind': 'mining.exchange.unbind',
  'mining.exchange.goMining': 'mining.exchange.goMining',
  'mining.exchange.exchange': 'mining.exchange.exchange',
  'mining.exchange.bindSteps': 'mining.exchange.bindSteps',
  'mining.exchange.step1': 'mining.exchange.step1',
  'mining.exchange.step2': 'mining.exchange.step2',
  'mining.exchange.goRegister': 'mining.exchange.goRegister',
  'mining.exchange.registerWarning': 'mining.exchange.registerWarning',
  'mining.exchange.uidPlaceholder': 'mining.exchange.uidPlaceholder',
  'mining.exchange.uidWarning': 'mining.exchange.uidWarning',
  'mining.exchange.noExchanges': 'mining.exchange.noExchanges',
  'mining.exchange.tryLater': 'mining.exchange.tryLater',

  // 排行榜
  'mining.leaderboard.title': 'mining.leaderboard.title',
  'mining.leaderboard.description': 'mining.leaderboard.description',
  'mining.leaderboard.noData': 'mining.leaderboard.noData',
  'mining.leaderboard.tryLater': 'mining.leaderboard.tryLater',

  // 错误消息
  'mining.error.fetchUserData': 'mining.error.fetchUserData',
  'mining.error.fetchLeaderboard': 'mining.error.fetchLeaderboard',
  'mining.error.fetchExchanges': 'mining.error.fetchExchanges',
  'mining.error.fetchUserExchanges': 'mining.error.fetchUserExchanges',
  'mining.error.notLoggedIn': 'mining.error.notLoggedIn',
  'mining.error.unbindExchange': 'mining.error.unbindExchange',
  'mining.error.enterUid': 'mining.error.enterUid',
  'mining.error.bindExchange': 'mining.error.bindExchange',
  'mining.error.dailyDataFailed': 'mining.error.dailyDataFailed',

  // 成功消息
  'mining.success.unbindExchange': 'mining.success.unbindExchange',
  'mining.success.bindExchange': 'mining.success.bindExchange',

  // 对话框
  'mining.dialog.title': 'mining.dialog.title',
  'mining.dialog.description': 'mining.dialog.description',
  'mining.dialog.uidLabel': 'mining.dialog.uidLabel',
  'mining.dialog.uidPlaceholder': 'mining.dialog.uidPlaceholder',
  'mining.dialog.cancel': 'mining.dialog.cancel',
  'mining.dialog.confirm': 'mining.dialog.confirm'
}

/**
 * 迁移翻译键
 * @param oldKey 旧的翻译键
 * @returns 新的翻译键，如果没有映射则返回原键
 */
export function migrateTranslationKey(oldKey: string): string {
  return translationKeyMigrationMap[oldKey] || oldKey
}

/**
 * 批量迁移翻译键
 * @param oldKeys 旧的翻译键数组
 * @returns 新的翻译键数组
 */
export function migrateTranslationKeys(oldKeys: string[]): string[] {
  return oldKeys.map(migrateTranslationKey)
}
