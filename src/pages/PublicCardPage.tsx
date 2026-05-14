import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Building2, ChevronRight, Download, Mail, Phone, Send, Share2, Sparkles } from 'lucide-react'

import { ContactSection } from '../components/public-card/ContactSection'
import type { ContactLabels } from '../components/public