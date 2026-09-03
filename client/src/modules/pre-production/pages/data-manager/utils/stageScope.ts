import { useLocation } from 'react-router-dom'

export type DataManagerStage = 'all' | 'pre_production' | 'event'

export const getDataManagerStageFromPath = (pathname: string): DataManagerStage => {
    if (pathname.includes('/data-manager/event/')) return 'event'
    if (pathname.includes('/data-manager/pre-production/')) return 'pre_production'
    return 'all'
}

export const getDataManagerStageLabel = (stage: DataManagerStage) => {
    if (stage === 'event') return 'Event'
    if (stage === 'pre_production') return 'Pre-production'
    return 'All'
}

const hasEventRawUploads = (item: any) => Boolean(
    item.drive_link || item.video_drive_link ||
    item.event_photo_approved || item.event_video_approved ||
    item.drone_photo_drive_link || item.drone_video_drive_link
)

/** True when UI should show event-stage team/uploads (including after advancing to post_production). */
export const hasEventRawDataContext = (item: any) => {
    const phase = String(item?.current_phase || item?.currentPhase || '').trim().toLowerCase()
    if (phase === 'event') return true
    return Boolean(
        item?.event_photo_approved ||
        item?.event_video_approved ||
        item?.photo_upload_phase === 'event' ||
        item?.video_upload_phase === 'event' ||
        item?.drone_upload_phase === 'event' ||
        (
            phase === 'post_production' &&
            (item?.drone_photo_drive_link || item?.drone_video_drive_link || hasEventRawUploads(item))
        )
    )
}




export const matchesDataManagerStage = (item: any, stage: DataManagerStage) => {
    if (stage === 'all') return true
    const phase = String(item.current_phase || item.currentPhase || '').trim().toLowerCase()
    
    if (stage === 'pre_production') {
        if (phase === 'pre_production') return true
        // Allow historical pre-production data to remain visible
        if (item.save_the_date_drive_link || item.save_the_video_drive_link || item.retouch_drive_link) {
            return true
        }
        if (item.photo_upload_phase === 'pre_production' || item.video_upload_phase === 'pre_production' || item.drone_upload_phase === 'pre_production') {
            return true
        }
    }
    
    if (stage === 'event') {
        if (phase === 'event') return true
        if (hasEventRawDataContext(item)) return true
    }

    return false
}

export const useDataManagerStageScope = () => {
    const location = useLocation()
    const stage = getDataManagerStageFromPath(location.pathname)
    return {
        stage,
        label: getDataManagerStageLabel(stage),
    }
}

