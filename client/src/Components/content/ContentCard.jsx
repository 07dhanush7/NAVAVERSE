import { assetUrl } from "../../api/axios";
import { memo } from "react";

const ContentCard = ({
  item,
  actionLabel,
  onAction,
  onView,
}) => {
  const imageUrl = item?.image
    ? assetUrl(encodeURI(item.image))
    : item?.companyLogo
      ? assetUrl(encodeURI(item.companyLogo))
      : "https://via.placeholder.com/400x220";

  const shortDescription = item?.description?.length > 140
    ? `${item.description.slice(0, 140)}...`
    : item?.description;

  return (
    <div className="content-card card">
      <div className="content-card-image card-image">
        <img
          src={imageUrl}
          alt={item?.title || "Content"}
          loading="lazy"
          decoding="async"
          width="400"
          height="220"
        />
      </div>

      <div className="content-card-body card-content">
        <p className="content-card-category">{item?.category}</p>
        <h3>{item?.title}</h3>
        <p className="content-card-description">{shortDescription}</p>

        <div className="content-card-actions">
          {onView && (
            <button type="button" className="content-card-btn secondary" onClick={() => onView(item)}>
              View
            </button>
          )}

          {onAction && (
            <button
              type="button"
              className="content-card-btn primary button-primary"
              onClick={() => onAction(item)}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ContentCard);


