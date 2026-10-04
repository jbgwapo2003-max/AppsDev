import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, MessageSquareText, Store, UserRound } from "lucide-react";
import { ProfileEditor } from "@/components/profile-editor";
import { RatingPill } from "@/components/rating";
import { ReviewHelpfulButton } from "@/components/review-helpful-button";
import { SpotCard } from "@/components/spot-card";
import { getReviewAverage } from "@/lib/reviews";
import { getProfilePageData } from "@/lib/supabase/profiles";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProfilePageData(id);

  if (!data) {
    notFound();
  }

  const { profile, viewerId, spots, reviews } = data;
  const isOwner = viewerId === profile.id;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-lg border border-charcoal/10 bg-white shadow-soft">
        <div className="h-28 bg-[linear-gradient(135deg,rgba(14,121,178,0.95),rgba(25,25,35,0.9))] sm:h-36" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 grid gap-5 sm:-mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(220px,256px)] lg:items-end">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
              <div className="grid size-24 place-items-center overflow-hidden rounded-full border-4 border-white bg-smoke text-leaf shadow-soft sm:size-28">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={`${profile.displayName} profile picture`} className="h-full w-full object-cover" /> : <UserRound size={40} aria-hidden="true" />}
              </div>
              <div className="min-w-0 pb-1 sm:pt-14">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf sm:text-sm">Kanto Finds profile</p>
                <h1 className="max-w-full font-display text-3xl font-semibold leading-tight text-charcoal [overflow-wrap:anywhere] sm:text-4xl">{profile.displayName}</h1>
                <p className="mt-2 max-w-2xl text-base leading-7 text-ink/75">{profile.bio || "No bio yet."}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:w-64 lg:justify-self-end">
              <Stat icon={<Store size={18} />} label="Posts" value={spots.length} />
              <Stat icon={<MessageSquareText size={18} />} label="Reviews" value={reviews.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-chili">Submitted stalls</p>
                <h2 className="font-display text-4xl font-semibold text-charcoal">Posts</h2>
              </div>
            </div>
            {spots.length ? (
              <div className="grid gap-4">
                {spots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            ) : (
              <EmptyState title="No submitted stalls yet" body={isOwner ? "Share your first streetfood spot so it can appear on your profile." : "This user has not shared any streetfood spots yet."} />
            )}
          </section>

          <section>
            <div className="mb-3">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-chili">Streetfood notes</p>
              <h2 className="font-display text-4xl font-semibold text-charcoal">Reviews</h2>
            </div>
            {reviews.length ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        {review.spot ? (
                          <Link href={`/spots/${review.spot.id}`} className="font-bold text-charcoal hover:text-leaf">
                            {review.spot.name}
                          </Link>
                        ) : (
                          <p className="font-bold text-charcoal">Streetfood stall</p>
                        )}
                        <p className="text-sm text-ink/60">
                          {review.spot ? `${review.spot.neighborhood}, ${review.spot.city} · ` : ""}
                          {new Date(review.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <RatingPill rating={Number(getReviewAverage(review).toFixed(1))} />
                    </div>
                    <p className="mt-3 text-base leading-7 text-ink/80">{review.comment}</p>
                    <div className="mt-4">
                      <ReviewHelpfulButton reviewId={review.id} initialCount={review.helpfulCount} initiallyLiked={review.viewerHasLiked} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No reviews yet" body={isOwner ? "Review a stall to start building your profile activity." : "This user has not written any public reviews yet."} />
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {isOwner ? <ProfileEditor profile={profile} /> : null}
          <div className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm">
            <h2 className="font-display text-3xl font-semibold text-charcoal">Profile details</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Member since {new Date(profile.createdAt).toLocaleDateString("en-PH", { month: "long", year: "numeric" })}.
            </p>
            {isOwner ? (
              <Link href="/submit" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90">
                <MapPin size={17} aria-hidden="true" /> Share a spot
              </Link>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-md bg-rice p-3">
      <div className="flex items-center gap-2 text-leaf">{icon}<span className="text-xs font-bold uppercase tracking-[0.16em]">{label}</span></div>
      <p className="mt-1 font-mono text-2xl font-bold text-charcoal">{value}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-charcoal/20 bg-white p-5 text-sm leading-6 text-ink/70">
      <p className="font-bold text-charcoal">{title}</p>
      <p className="mt-1">{body}</p>
    </div>
  );
}
