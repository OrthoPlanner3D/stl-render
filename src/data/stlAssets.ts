import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

import stl_max_1 from '../assets/files-v2/1Maxillary.stl'
import stl_max_1_att from '../assets/files-v2/1Maxillary_with_attachments.stl'
import stl_max_2 from '../assets/files-v2/2Maxillary.stl'
import stl_max_3 from '../assets/files-v2/3Maxillary.stl'
import stl_max_4 from '../assets/files-v2/4Maxillary.stl'
import stl_max_5 from '../assets/files-v2/5Maxillary.stl'
import stl_max_6 from '../assets/files-v2/6Maxillary.stl'
import stl_max_7 from '../assets/files-v2/7Maxillary.stl'
import stl_max_8 from '../assets/files-v2/8Maxillary.stl'
import stl_max_9 from '../assets/files-v2/9Maxillary.stl'
import stl_max_10 from '../assets/files-v2/10Maxillary.stl'
import stl_max_11 from '../assets/files-v2/11Maxillary.stl'
import stl_max_12 from '../assets/files-v2/12Maxillary.stl'
import stl_max_13 from '../assets/files-v2/13Maxillary.stl'
import stl_max_14 from '../assets/files-v2/14Maxillary.stl'
import stl_max_15 from '../assets/files-v2/15Maxillary.stl'
import stl_max_16 from '../assets/files-v2/16Maxillary.stl'
import stl_max_17 from '../assets/files-v2/17Maxillary.stl'
import stl_max_18 from '../assets/files-v2/18Maxillary.stl'
import stl_man_1 from '../assets/files-v2/1Mandibular.stl'
import stl_man_1_att from '../assets/files-v2/1Mandibular_with_attachments.stl'
import stl_man_2 from '../assets/files-v2/2Mandibular.stl'
import stl_man_3 from '../assets/files-v2/3Mandibular.stl'
import stl_man_4 from '../assets/files-v2/4Mandibular.stl'
import stl_man_5 from '../assets/files-v2/5Mandibular.stl'
import stl_man_6 from '../assets/files-v2/6Mandibular.stl'
import stl_man_7 from '../assets/files-v2/7Mandibular.stl'
import stl_man_8 from '../assets/files-v2/8Mandibular.stl'
import stl_man_9 from '../assets/files-v2/9Mandibular.stl'
import stl_man_10 from '../assets/files-v2/10Mandibular.stl'
import stl_man_11 from '../assets/files-v2/11Mandibular.stl'
import stl_man_12 from '../assets/files-v2/12Mandibular.stl'
import stl_man_13 from '../assets/files-v2/13Mandibular.stl'
import stl_man_14 from '../assets/files-v2/14Mandibular.stl'
import stl_man_15 from '../assets/files-v2/15Mandibular.stl'
import stl_man_16 from '../assets/files-v2/16Mandibular.stl'
import stl_man_17 from '../assets/files-v2/17Mandibular.stl'
import stl_man_18 from '../assets/files-v2/18Mandibular.stl'

export const MAXILLARY = {
  label: 'Maxilar',
  stls: [
    stl_max_1, stl_max_1_att,
    stl_max_2, stl_max_3, stl_max_4, stl_max_5, stl_max_6,
    stl_max_7, stl_max_8, stl_max_9, stl_max_10, stl_max_11,
    stl_max_12, stl_max_13, stl_max_14, stl_max_15, stl_max_16,
    stl_max_17, stl_max_18,
  ],
  names: ['1', '1+', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
  filenames: [
    '1Maxillary.stl', '1Maxillary_with_attachments.stl',
    '2Maxillary.stl', '3Maxillary.stl', '4Maxillary.stl', '5Maxillary.stl', '6Maxillary.stl',
    '7Maxillary.stl', '8Maxillary.stl', '9Maxillary.stl', '10Maxillary.stl', '11Maxillary.stl',
    '12Maxillary.stl', '13Maxillary.stl', '14Maxillary.stl', '15Maxillary.stl', '16Maxillary.stl',
    '17Maxillary.stl', '18Maxillary.stl',
  ],
}

export const MANDIBULAR = {
  label: 'Mandibular',
  stls: [
    stl_man_1, stl_man_1_att,
    stl_man_2, stl_man_3, stl_man_4, stl_man_5, stl_man_6,
    stl_man_7, stl_man_8, stl_man_9, stl_man_10, stl_man_11,
    stl_man_12, stl_man_13, stl_man_14, stl_man_15, stl_man_16,
    stl_man_17, stl_man_18,
  ],
  names: ['1', '1+', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
  filenames: [
    '1Mandibular.stl', '1Mandibular_with_attachments.stl',
    '2Mandibular.stl', '3Mandibular.stl', '4Mandibular.stl', '5Mandibular.stl', '6Mandibular.stl',
    '7Mandibular.stl', '8Mandibular.stl', '9Mandibular.stl', '10Mandibular.stl', '11Mandibular.stl',
    '12Mandibular.stl', '13Mandibular.stl', '14Mandibular.stl', '15Mandibular.stl', '16Mandibular.stl',
    '17Mandibular.stl', '18Mandibular.stl',
  ],
}

export const allStls = [...MAXILLARY.stls, ...MANDIBULAR.stls]

// Preload all STL geometries into R3F cache at module init time
allStls.forEach(url => useLoader.preload(STLLoader, url))
