import { useUser } from 'web/hooks/use-user'
import { Button } from 'web/components/buttons/button'
import { withTracking } from 'web/lib/service/analytics'
import { toast } from 'react-hot-toast'
import { Modal } from 'web/components/layout/modal'
import { Row } from 'web/components/layout/row'
import { useState } from 'react'
import { Col } from 'web/components/layout/col'
import { Title } from 'web/components/widgets/title'
import { capitalize } from 'lodash'
import { ReportProps } from 'common/report'
import { report as reportContent } from 'web/lib/api/api'
import { useTranslations } from 'next-intl'

export function ReportButton(props: { report: ReportProps }) {
  const { report } = props
  const { contentOwnerId, contentType } = report
  const currentUser = useUser()
  const t = useTranslations('market')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const label = contentType === 'contract' ? 'question' : contentType
  if (!currentUser || currentUser.id === contentOwnerId) return null

  return (
    <>
      <Button
        size={'xs'}
        color={'yellow-outline'}
        onClick={() => {
          setIsModalOpen(true)
        }}
      >
        {t('report')}
      </Button>
      <ReportModal
        isModalOpen={isModalOpen}
        label={label}
        setIsModalOpen={setIsModalOpen}
        report={report}
      />
    </>
  )
}

export const ReportModal = (props: {
  isModalOpen: boolean
  setIsModalOpen: (isModalOpen: boolean) => void
  label: string
  report: ReportProps
}) => {
  const { label, report, setIsModalOpen, isModalOpen } = props
  const t = useTranslations('market')
  const tc = useTranslations('common')

  const [isReported, setIsReported] = useState(false)

  const onReport = async () => {
    await toast.promise(reportContent(report), {
      loading: t('reportingIn'),
      success: `${capitalize(label)} ${t('reportedMessage')}`,
      error: `${t('reportErrorMessage')} ${label}`,
    })
    setIsReported(true)
  }

  return (
    <Modal open={isModalOpen} setOpen={setIsModalOpen}>
      <Col className={'bg-canvas-0 rounded-md p-4'}>
        <Title>{t('reportQuestion')}</Title>
        <span className={'mb-4 text-sm'}>
          {isReported
            ? t('alreadyReported')
            : t('reportTitle')}
          <a
            href="https://docs.predictarena.com/community-guidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-800 hover:underline"
          >
            guidelines
          </a>
          .
        </span>
        <Row className={'items-center justify-between'}>
          <Button color={'gray-white'} onClick={() => setIsModalOpen(false)}>
            {isReported ? tc('done') : tc('cancel')}
          </Button>
          {!isReported && (
            <Button
              size="sm"
              color="red"
              className="my-auto"
              onClick={withTracking(onReport, 'block')}
            >
              {t('report')} {label}
            </Button>
          )}
        </Row>
      </Col>
    </Modal>
  )
}
