import { Link } from '@heroui/link'
import { button } from '@heroui/theme'

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Link
        className={button({
          color: 'primary',
          radius: 'full',
          variant: 'shadow',
        })}
        href="/check-list"
      >
        Check List
      </Link>
      <Link
        className={button({
          color: 'primary',
          radius: 'full',
          variant: 'shadow',
        })}
        href="/create-room"
      >
        Create Room
      </Link>
      <Link
        className={button({
          color: 'primary',
          radius: 'full',
          variant: 'shadow',
        })}
        href="/show-room"
      >
        Show Rooms
      </Link>
    </section>
  )
}
