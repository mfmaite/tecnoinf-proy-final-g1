import React from 'react';

import ParticipantsPageComponent from '../components/participants-page';

type Params = { params: { courseId: string } }

export default async function ParticipantsPage({ params }: Params) {
  return (
    <ParticipantsPageComponent courseId={params.courseId} />
  )
}


