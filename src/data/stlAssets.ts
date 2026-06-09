import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const _draco = new DRACOLoader()
_draco.setDecoderPath('/draco/')

export function extendGLTFLoader(loader: GLTFLoader) {
  loader.setDRACOLoader(_draco)
}

import glb_max_1 from '../assets/files-glb/1Maxillary.glb'
import glb_max_1_att from '../assets/files-glb/1Maxillary_with_attachments.glb'
import glb_max_2 from '../assets/files-glb/2Maxillary.glb'
import glb_max_3 from '../assets/files-glb/3Maxillary.glb'
import glb_max_4 from '../assets/files-glb/4Maxillary.glb'
import glb_max_5 from '../assets/files-glb/5Maxillary.glb'
import glb_max_6 from '../assets/files-glb/6Maxillary.glb'
import glb_max_7 from '../assets/files-glb/7Maxillary.glb'
import glb_max_8 from '../assets/files-glb/8Maxillary.glb'
import glb_max_9 from '../assets/files-glb/9Maxillary.glb'
import glb_max_10 from '../assets/files-glb/10Maxillary.glb'
import glb_max_11 from '../assets/files-glb/11Maxillary.glb'
import glb_max_12 from '../assets/files-glb/12Maxillary.glb'
import glb_max_13 from '../assets/files-glb/13Maxillary.glb'
import glb_max_14 from '../assets/files-glb/14Maxillary.glb'
import glb_max_15 from '../assets/files-glb/15Maxillary.glb'
import glb_max_16 from '../assets/files-glb/16Maxillary.glb'
import glb_max_17 from '../assets/files-glb/17Maxillary.glb'
import glb_max_18 from '../assets/files-glb/18Maxillary.glb'
import glb_man_1 from '../assets/files-glb/1Mandibular.glb'
import glb_man_1_att from '../assets/files-glb/1Mandibular_with_attachments.glb'
import glb_man_2 from '../assets/files-glb/2Mandibular.glb'
import glb_man_3 from '../assets/files-glb/3Mandibular.glb'
import glb_man_4 from '../assets/files-glb/4Mandibular.glb'
import glb_man_5 from '../assets/files-glb/5Mandibular.glb'
import glb_man_6 from '../assets/files-glb/6Mandibular.glb'
import glb_man_7 from '../assets/files-glb/7Mandibular.glb'
import glb_man_8 from '../assets/files-glb/8Mandibular.glb'
import glb_man_9 from '../assets/files-glb/9Mandibular.glb'
import glb_man_10 from '../assets/files-glb/10Mandibular.glb'
import glb_man_11 from '../assets/files-glb/11Mandibular.glb'
import glb_man_12 from '../assets/files-glb/12Mandibular.glb'
import glb_man_13 from '../assets/files-glb/13Mandibular.glb'
import glb_man_14 from '../assets/files-glb/14Mandibular.glb'
import glb_man_15 from '../assets/files-glb/15Mandibular.glb'
import glb_man_16 from '../assets/files-glb/16Mandibular.glb'
import glb_man_17 from '../assets/files-glb/17Mandibular.glb'
import glb_man_18 from '../assets/files-glb/18Mandibular.glb'

export const MAXILLARY = {
  label: 'Maxilar',
  stls: [
    glb_max_1, glb_max_1_att,
    glb_max_2, glb_max_3, glb_max_4, glb_max_5, glb_max_6,
    glb_max_7, glb_max_8, glb_max_9, glb_max_10, glb_max_11,
    glb_max_12, glb_max_13, glb_max_14, glb_max_15, glb_max_16,
    glb_max_17, glb_max_18,
  ],
  names: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
  filenames: [
    '1Maxillary.glb', '1Maxillary_with_attachments.glb',
    '2Maxillary.glb', '3Maxillary.glb', '4Maxillary.glb', '5Maxillary.glb', '6Maxillary.glb',
    '7Maxillary.glb', '8Maxillary.glb', '9Maxillary.glb', '10Maxillary.glb', '11Maxillary.glb',
    '12Maxillary.glb', '13Maxillary.glb', '14Maxillary.glb', '15Maxillary.glb', '16Maxillary.glb',
    '17Maxillary.glb', '18Maxillary.glb',
  ],
}

export const MANDIBULAR = {
  label: 'Mandibular',
  stls: [
    glb_man_1, glb_man_1_att,
    glb_man_2, glb_man_3, glb_man_4, glb_man_5, glb_man_6,
    glb_man_7, glb_man_8, glb_man_9, glb_man_10, glb_man_11,
    glb_man_12, glb_man_13, glb_man_14, glb_man_15, glb_man_16,
    glb_man_17, glb_man_18,
  ],
  names: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
  filenames: [
    '1Mandibular.glb', '1Mandibular_with_attachments.glb',
    '2Mandibular.glb', '3Mandibular.glb', '4Mandibular.glb', '5Mandibular.glb', '6Mandibular.glb',
    '7Mandibular.glb', '8Mandibular.glb', '9Mandibular.glb', '10Mandibular.glb', '11Mandibular.glb',
    '12Mandibular.glb', '13Mandibular.glb', '14Mandibular.glb', '15Mandibular.glb', '16Mandibular.glb',
    '17Mandibular.glb', '18Mandibular.glb',
  ],
}

const allGlbs = [...MAXILLARY.stls, ...MANDIBULAR.stls]
allGlbs.forEach(url => useLoader.preload(GLTFLoader, url, extendGLTFLoader))
