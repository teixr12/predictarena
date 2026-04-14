import { useTranslations } from 'next-intl'
import {
  ChatIcon,
  DeviceMobileIcon,
  HeartIcon,
  LoginIcon,
  LogoutIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
} from '@heroicons/react/outline'
// import { PiTelevisionSimple } from 'react-icons/pi'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import TrophyIcon from 'web/lib/icons/trophy-icon.svg'

import { buildArray } from 'common/util/array'
import { DAY_MS } from 'common/util/time'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LuGem } from 'react-icons/lu'
import { IoCompassOutline } from 'react-icons/io5'
import { AppBadgesOrGetAppButton } from 'web/components/buttons/app-badges-or-get-app-button'
import { CreateQuestionButton } from 'web/components/buttons/create-question-button'
import { NotificationsIcon } from 'web/components/notifications-icon'
import { useAdminOrMod } from 'web/hooks/use-admin'
import { useTheme } from 'web/hooks/use-theme'
import { useUser } from 'web/hooks/use-user'
import { firebaseLogin, firebaseLogout } from 'web/lib/firebase/users'
import { withTracking } from 'web/lib/service/analytics'
import { MobileAppsQRCodeDialog } from '../buttons/mobile-apps-qr-code-button'
import { SidebarSignUpButton } from '../buttons/sign-up-button'
import { Col } from '../layout/col'
import { AddFundsButton } from '../profile/add-funds-button'
import { ReportsIcon } from '../reports-icon'
import { LiveTVIcon } from '../tv-icon'
import { useTVIsLive } from '../tv/tv-schedule'
import { LanguageToggle } from './language-toggle'
import { PredictaLogo } from './predicta-logo'
import { ProfileSummary } from './profile-summary'
import { NavItem, SidebarItem } from './sidebar-item'

export const SPEND_CREDITS_ENABLED = true

// Bump this number to re-show the NEW badge on Shop for all users
const SHOP_NEW_VERSION = 1
const SHOP_SEEN_KEY = 'shop-new-seen-version'

export default function Sidebar(props: {
  className?: string
  isMobile?: boolean
}) {
  const { className, isMobile } = props
  const t = useTranslations('nav')
  const router = useRouter()
  const currentPage = usePathname() ?? undefined
  const user = useUser()
  const isAdminOrMod = useAdminOrMod()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false)

  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'auto' ? 'dark' : theme === 'dark' ? 'light' : 'auto')
  }

  const isNewUser = !!user && user.createdTime > Date.now() - DAY_MS

  const isLiveTV = useTVIsLive(10)

  const [showShopBadge, setShowShopBadge] = useState(false)
  useEffect(() => {
    const seen = parseInt(localStorage.getItem(SHOP_SEEN_KEY) ?? '0', 10)
    setShowShopBadge(seen < SHOP_NEW_VERSION)
  }, [])
  const onShopClick = () => {
    localStorage.setItem(SHOP_SEEN_KEY, String(SHOP_NEW_VERSION))
    setShowShopBadge(false)
  }

  const navOptions = isMobile
    ? getMobileNav(t, !!user, () => setIsAddFundsModalOpen(!isAddFundsModalOpen), {
        isNewUser,
        isLiveTV,
        isAdminOrMod: isAdminOrMod,
        showShopBadge,
        onShopClick,
      })
    : getDesktopNav(t, !!user, () => setIsModalOpen(true), {
        isNewUser,
        isLiveTV,
        isAdminOrMod: isAdminOrMod,
        showShopBadge,
        onShopClick,
      })

  const bottomNavOptions = bottomNav(
    t,
    !!user,
    theme,
    toggleTheme,
    router,
    isMobile
  )

  const createMarketButton = user && !user.isBannedFromPosting && (
    <CreateQuestionButton
      key="create-market-button"
      className={'mt-4 w-full'}
    />
  )

  const addFundsButton = user && (
    <AddFundsButton
      userId={user.id}
      className="w-full whitespace-nowrap"
      size="xl"
    />
  )

  return (
    <nav
      aria-label="Sidebar"
      className={clsx('flex h-screen flex-col', className)}
    >
      <PredictaLogo className="pb-3 pt-6" />

      {user && !isMobile && <ProfileSummary user={user} className="mb-3" />}

      <div className="mb-4 flex flex-col gap-1">
        {navOptions.map((item) => (
          <SidebarItem key={item.name} item={item} currentPage={currentPage} />
        ))}

        <MobileAppsQRCodeDialog
          key="mobile-apps-qr-code"
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />

        {!user && <SidebarSignUpButton />}

        <Col className="gap-2">
          {createMarketButton}
          {addFundsButton}
        </Col>
      </div>
      <div
        className={clsx('mb-6 mt-auto flex flex-col gap-1', isMobile && 'pb-8')}
      >
        {!!user && <AppBadgesOrGetAppButton hideOnDesktop className="mb-2" />}
        {bottomNavOptions.map((item) => (
          <SidebarItem key={item.name} item={item} currentPage={currentPage} />
        ))}
        <div className="px-3 pt-1">
          <LanguageToggle />
        </div>
      </div>
    </nav>
  )
}

const getDesktopNav = (
  t: (key: string) => string,
  loggedIn: boolean,
  openDownloadApp: () => void,
  options: {
    isNewUser: boolean
    isLiveTV?: boolean
    isAdminOrMod: boolean
    showShopBadge: boolean
    onShopClick: () => void
  }
) => {
  const { isLiveTV } = options
  if (loggedIn)
    return buildArray(
      { name: t('browse'), href: '/home', icon: SearchIcon },
      {
        name: t('explore'),
        href: '/explore',
        icon: IoCompassOutline,
        iconClassName: '!h-[1.6rem] !w-[1.6rem] !mr-[0.65rem]',
      },
      isLiveTV && {
        name: t('live'),
        href: '/tv',
        icon: LiveTVIcon,
      },
      {
        name: t('notifications'),
        href: `/notifications`,
        icon: NotificationsIcon,
      },
      { name: t('leagues'), href: '/leagues', icon: TrophyIcon },
      {
        name: t('kalshiPrep'),
        href: '/kalshi-prep',
        icon: SparklesIcon,
      },
      {
        name: t('forum'),
        href: '/posts',
        icon: ChatIcon,
      },
      // Show shop when enabled OR for admins (testing)
      (SPEND_CREDITS_ENABLED || options.isAdminOrMod) && {
        name: t('shop'),
        href: '/shop',
        icon: LuGem,
        onClick: options.onShopClick,
        children: options.showShopBadge ? (
          <>
            {t('shop')}
            <span className="ml-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
              NEW
            </span>
          </>
        ) : undefined,
      },
      options.isAdminOrMod && {
        name: t('reports'),
        href: '/reports',
        icon: ReportsIcon,
      }
    )

  return buildArray(
    { name: t('browse'), href: '/', icon: SearchIcon },
    { name: 'Predictle', href: '/predictle', icon: SparklesIcon },
    { name: t('about'), href: '/about', icon: QuestionMarkCircleIcon },
    { name: 'App', onClick: openDownloadApp, icon: DeviceMobileIcon }
  )
}

const getMobileNav = (
  t: (key: string) => string,
  loggedIn: boolean,
  toggleModal: () => void,
  options: {
    isNewUser: boolean
    isLiveTV?: boolean
    isAdminOrMod: boolean
    showShopBadge: boolean
    onShopClick: () => void
  }
) => {
  const { isAdminOrMod, isLiveTV } = options

  return buildArray<NavItem>(
    { name: t('leagues'), href: '/leagues', icon: TrophyIcon },
    { name: t('forum'), href: '/posts', icon: ChatIcon },
    { name: 'Charity', href: '/charity', icon: HeartIcon },
    loggedIn && {
      name: 'Referrals',
      href: '/referrals',
      icon: StarIcon,
    },
    isLiveTV && {
      name: t('live'),
      href: '/tv',
      icon: LiveTVIcon,
    },
    isAdminOrMod && {
      name: t('reports'),
      href: '/reports',
      icon: ReportsIcon,
    },
    // Show shop when enabled OR for admins (testing)
    (SPEND_CREDITS_ENABLED || isAdminOrMod) && {
      name: t('shop'),
      href: '/shop',
      icon: LuGem,
      onClick: options.onShopClick,
      children: options.showShopBadge ? (
        <>
          {t('shop')}
          <span className="ml-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
            NEW
          </span>
        </>
      ) : undefined,
    }
  )
}

const bottomNav = (
  t: (key: string) => string,
  loggedIn: boolean,
  theme: 'light' | 'dark' | 'auto',
  toggleTheme: () => void,
  router: AppRouterInstance,
  isMobile: boolean | undefined
) =>
  buildArray<NavItem>(
    loggedIn && { name: t('about'), href: '/about', icon: QuestionMarkCircleIcon },
    loggedIn &&
      !isMobile && {
        name: 'Referrals',
        href: '/referrals',
        icon: StarIcon,
      },
    {
      name: theme ?? 'auto',
      children:
        theme === 'light' ? (
          t('light')
        ) : theme === 'dark' ? (
          t('dark')
        ) : (
          <>
            <span className="hidden dark:inline">{t('dark')}</span>
            <span className="inline dark:hidden">{t('light')}</span> ({t('auto')})
          </>
        ),
      icon: ({ className, ...props }) => (
        <>
          <MoonIcon
            className={clsx(className, 'hidden dark:block')}
            {...props}
          />
          <SunIcon
            className={clsx(className, 'block dark:hidden')}
            {...props}
          />
        </>
      ),
      onClick: toggleTheme,
    },
    loggedIn && {
      name: t('signOut'),
      icon: LogoutIcon,
      onClick: async () => {
        await withTracking(firebaseLogout, 'sign out')()
        await router.refresh()
      },
    },
    !loggedIn && { name: t('signIn'), icon: LoginIcon, onClick: firebaseLogin }
  )
